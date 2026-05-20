use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    events::TokenBought,
    state::*,
};

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [
            TOKEN_STATE_SEED,
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub token_state: Account<'info, TokenState>,
    
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = token_mint,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [
            FEE_VAULT_SEED,
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub fee_vault: Account<'info, FeeVault>,
    
    /// CHECK: Protocol fee wallet
    #[account(mut)]
    pub protocol_fee_account: AccountInfo<'info>,
    
    /// CHECK: Creator fee wallet
    #[account(mut)]
    pub creator_fee_account: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

/// Get leverage fee in BPS based on leverage level
fn get_leverage_fee_bps(leverage: u8) -> u64 {
    match leverage {
        2 => LEVERAGE_FEE_2X_BPS,
        3 => LEVERAGE_FEE_3X_BPS,
        5 => LEVERAGE_FEE_5X_BPS,
        10 => LEVERAGE_FEE_10X_BPS,
        _ => LEVERAGE_FEE_2X_BPS, // Default to lowest
    }
}

pub fn handler(ctx: Context<Buy>, sol_amount: u64) -> Result<()> {
    let token_mint_key = ctx.accounts.token_mint.key();
    let token_state = &mut ctx.accounts.token_state;
    
    require!(!token_state.paused, LeveragedMemeError::ContractPaused);
    require!(!token_state.graduated, LeveragedMemeError::AlreadyGraduated);
    require!(
        token_state.curve_state.real_token_reserve > 0,
        LeveragedMemeError::InsufficientLiquidity
    );
    
    // Calculate trading fee (0.5%)
    let trading_fee = sol_amount
        .checked_mul(TRADING_FEE_BPS)
        .ok_or(LeveragedMemeError::MathOverflow)?
        .checked_div(10000)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Calculate leverage fee based on token's leverage
    let leverage_fee_bps = get_leverage_fee_bps(token_state.leverage);
    let leverage_fee = sol_amount
        .checked_mul(leverage_fee_bps)
        .ok_or(LeveragedMemeError::MathOverflow)?
        .checked_div(10000)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Total fees
    let total_fee = trading_fee
        .checked_add(leverage_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    let sol_for_curve = sol_amount
        .checked_sub(total_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    let tokens_out = token_state.curve_state.buy(sol_for_curve)?;
    require!(tokens_out > 0, LeveragedMemeError::MathOverflow);
    require!(
        tokens_out <= token_state.curve_state.real_token_reserve,
        LeveragedMemeError::InsufficientLiquidity
    );
    
    // Transfer SOL to curve
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.curve_token_account.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, sol_for_curve)?;
    
    // Split trading fees: 50% protocol, 50% creator
    let protocol_trading_fee = trading_fee
        .checked_mul(PROTOCOL_FEE_SHARE)
        .ok_or(LeveragedMemeError::MathOverflow)?
        .checked_div(100)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    let creator_trading_fee = trading_fee
        .checked_sub(protocol_trading_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Leverage fee goes entirely to protocol
    let total_protocol_fee = protocol_trading_fee
        .checked_add(leverage_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Transfer protocol fees (trading + leverage)
    if total_protocol_fee > 0 {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.protocol_fee_account.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, total_protocol_fee)?;
    }
    
    // Transfer creator fees
    if creator_trading_fee > 0 {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.creator_fee_account.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, creator_trading_fee)?;
    }
    
    // Update fee vault - track creator fees for referral calculation
    let fee_vault = &mut ctx.accounts.fee_vault;
    fee_vault.total_collected = fee_vault.total_collected
        .checked_add(total_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Track creator fees separately for referral rewards
    // Referrer gets 10% of creator fees
    if let Some(_referrer) = fee_vault.referrer {
        let referral_reward = creator_trading_fee
            .checked_mul(REFERRAL_SHARE_BPS)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(10000)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        fee_vault.referral_rewards_total = fee_vault.referral_rewards_total
            .checked_add(referral_reward)
            .ok_or(LeveragedMemeError::MathOverflow)?;
    }
    
    // Transfer tokens to buyer
    let seeds = &[
        TOKEN_STATE_SEED,
        token_mint_key.as_ref(),
        &[ctx.bumps.token_state],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.curve_token_account.to_account_info(),
        to: ctx.accounts.buyer_token_account.to_account_info(),
        authority: token_state.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    
    token::transfer(cpi_ctx, tokens_out)?;
    
    // Update token state
    token_state.total_fees_collected = token_state.total_fees_collected
        .checked_add(total_fee)
        .ok_or(LeveragedMemeError::MathOverflow)?;
    
    // Emit buy event
    emit!(TokenBought {
        token_mint: token_mint_key,
        buyer: ctx.accounts.buyer.key(),
        sol_amount,
        tokens_received: tokens_out,
        price: token_state.curve_state.get_current_price(),
        timestamp: ctx.accounts.clock.unix_timestamp,
    });
    
    msg!("Bought {} tokens for {} SOL", tokens_out, sol_amount);
    msg!("Trading Fee: {} SOL, Leverage Fee: {} SOL", trading_fee, leverage_fee);
    
    Ok(())
}
