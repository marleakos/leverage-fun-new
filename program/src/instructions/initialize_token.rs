use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    events::TokenInitialized,
    state::*,
};

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = TOKEN_DECIMALS,
        mint::authority = creator,
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        space = 8 + TokenState::SIZE,
        seeds = [
            TOKEN_STATE_SEED,
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub token_state: Account<'info, TokenState>,

    #[account(
        init,
        payer = creator,
        space = 8 + FeeVault::SIZE,
        seeds = [
            FEE_VAULT_SEED,
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub fee_vault: Account<'info, FeeVault>,
    
    // User referral account - tracks who referred the creator
    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + UserReferral::SIZE,
        seeds = [
            USER_REFERRAL_SEED,
            creator.key().as_ref(),
        ],
        bump
    )]
    pub user_referral: Account<'info, UserReferral>,
    
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = token_state,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = token_state,
    )]
    pub lp_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<InitializeToken>,
    name: String,
    symbol: String,
    uri: String,
    leverage: u8,
    direction: Direction,
    underlying: Underlying,
    oracle_price_at_launch: u64,
    referrer: Option<Pubkey>,
) -> Result<()> {
    msg!("Starting initialize_token handler");
    require!(name.len() <= 32, LeveragedMemeError::NameTooLong);
    require!(symbol.len() <= 10, LeveragedMemeError::SymbolTooLong);
    require!(leverage >= 2 && leverage <= 10, LeveragedMemeError::InvalidLeverage);
    
    let clock = &ctx.accounts.clock;
    
    // Extract keys FIRST before any borrows
    let token_mint_key = ctx.accounts.token_mint.key();
    let creator_key = ctx.accounts.creator.key();
    
    msg!("Creator: {}", creator_key);
    msg!("Token mint: {}", token_mint_key);
    
    // Handle referral - if user has existing referrer, use that
    // Otherwise set the provided referrer (only once)
    let user_referral = &mut ctx.accounts.user_referral;
    
    // Always ensure user field is set
    if user_referral.user != creator_key {
        user_referral.user = creator_key;
    }
    
    let final_referrer = if user_referral.referred_by.is_some() {
        user_referral.referred_by
    } else {
        // Set the referrer if provided and not self
        let valid_referrer = referrer.filter(|r| *r != creator_key);
        user_referral.referred_by = valid_referrer;
        user_referral.total_referral_earnings = 0;
        user_referral.total_rewards_claimed = 0;
        valid_referrer
    };
    
    // Store keys for later use
    let token_mint_key_for_state = token_mint_key;
    let creator_key_for_state = creator_key;
    
    msg!("Setting up curve state");
    let curve_state = CurveState {
        virtual_sol_reserve: VIRTUAL_SOL_SEED,
        virtual_token_reserve: CURVE_RESERVE_AMOUNT,
        real_sol_reserve: 0,
        real_token_reserve: CURVE_RESERVE_AMOUNT,
        k: (VIRTUAL_SOL_SEED as u128)
            .checked_mul(CURVE_RESERVE_AMOUNT as u128)
            .ok_or(LeveragedMemeError::MathOverflow)?,
    };
    msg!("Curve state created");
    
    msg!("Setting up CPI for curve token mint");
    
    // Clone account infos before CPI to avoid borrow issues
    let token_mint_info = ctx.accounts.token_mint.to_account_info();
    let curve_token_account_info = ctx.accounts.curve_token_account.to_account_info();
    let creator_info = ctx.accounts.creator.to_account_info();
    let token_program_info = ctx.accounts.token_program.to_account_info();
    
    // Mint using creator as authority (mint was initialized with creator as authority)
    let cpi_accounts = token::MintTo {
        mint: token_mint_info.clone(),
        to: curve_token_account_info.clone(),
        authority: creator_info.clone(),
    };
    
    let cpi_ctx = CpiContext::new(
        token_program_info.clone(),
        cpi_accounts,
    );
    
    msg!("Minting curve tokens");
    token::mint_to(cpi_ctx, CURVE_RESERVE_AMOUNT)?;
    msg!("Curve tokens minted");
    
    // Clone for second mint
    let lp_token_account_info = ctx.accounts.lp_token_account.to_account_info();
    
    let cpi_accounts_lp = token::MintTo {
        mint: token_mint_info,
        to: lp_token_account_info,
        authority: creator_info,
    };
    
    let cpi_ctx_lp = CpiContext::new(
        token_program_info,
        cpi_accounts_lp,
    );
    
    token::mint_to(cpi_ctx_lp, LP_RESERVE_AMOUNT)?;
    
    // Transfer mint authority to token_state PDA
    msg!("Transferring mint authority to token_state");
    let cpi_set_authority = token::SetAuthority {
        current_authority: ctx.accounts.creator.to_account_info(),
        account_or_mint: ctx.accounts.token_mint.to_account_info(),
    };
    
    let seeds = &[
        TOKEN_STATE_SEED,
        token_mint_key_for_state.as_ref(),
        &[ctx.bumps.token_state],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_ctx_authority = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_set_authority,
        signer,
    );
    
    token::set_authority(
        cpi_ctx_authority,
        token::spl_token::instruction::AuthorityType::MintTokens,
        Some(ctx.accounts.token_state.key()),
    )?;
    msg!("Mint authority transferred");
    
    let token_state = &mut ctx.accounts.token_state;
    token_state.creator = creator_key_for_state;
    token_state.token_mint = token_mint_key_for_state;
    token_state.name = name.clone();
    token_state.symbol = symbol.clone();
    token_state.uri = uri;
    token_state.curve_state = curve_state;
    token_state.graduated = false;
    token_state.created_at = clock.unix_timestamp;
    token_state.total_fees_collected = 0;
    token_state.leverage = leverage;
    token_state.direction = direction;
    token_state.underlying = underlying;
    token_state.oracle_price_at_launch = oracle_price_at_launch;
    
    let fee_vault = &mut ctx.accounts.fee_vault;
    fee_vault.token_mint = token_mint_key_for_state;
    fee_vault.total_collected = 0;
    fee_vault.creator_claimed = 0;
    fee_vault.protocol_claimed = 0;
    fee_vault.creator_share_bps = (CREATOR_FEE_SHARE * 100) as u64;
    fee_vault.referrer = final_referrer;
    fee_vault.referral_rewards_total = 0;
    fee_vault.referral_rewards_claimed = 0;
    
    // Emit initialization event
    emit!(TokenInitialized {
        token_mint: token_mint_key_for_state,
        creator: creator_key_for_state,
        name: name.clone(),
        symbol: symbol.clone(),
        leverage,
        direction: direction as u8,
        underlying: underlying as u8,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Token initialized: {}", token_state.name);
    msg!("Symbol: {}", token_state.symbol);
    msg!("Leverage: {}x {:?} {:?}", leverage, direction, underlying);
    if let Some(ref_addr) = final_referrer {
        msg!("Referrer: {}", ref_addr);
    }
    
    Ok(())
}
