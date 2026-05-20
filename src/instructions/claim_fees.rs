use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    events::FeesClaimed,
    state::*,
};

#[derive(Accounts)]
pub struct ClaimFees<'info> {
    #[account(mut)]
    pub claimant: Signer<'info>,

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
    pub token_mint: Account<'info, anchor_spl::token::Mint>,

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

    /// CHECK: Creator fee wallet (must match token_state.creator)
    #[account(mut)]
    pub creator_fee_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimFees>) -> Result<()> {
    let token_state = &ctx.accounts.token_state;
    let fee_vault = &ctx.accounts.fee_vault;

    // Only creator or protocol can claim
    let is_creator = ctx.accounts.claimant.key() == token_state.creator;
    let is_protocol = ctx.accounts.claimant.key() == ctx.accounts.protocol_fee_account.key();

    require!(
        is_creator || is_protocol,
        LeveragedMemeError::Unauthorized
    );

    // Calculate claimable amount
    let total_collected = fee_vault.total_collected;
    let creator_share_bps = fee_vault.creator_share_bps;

    let creator_total = (total_collected as u128)
        .checked_mul(creator_share_bps as u128)
        .ok_or(LeveragedMemeError::MathOverflow)?
        .checked_div(10000)
        .ok_or(LeveragedMemeError::MathOverflow)? as u64;

    let protocol_total = total_collected
        .checked_sub(creator_total)
        .ok_or(LeveragedMemeError::MathOverflow)?;

    // Transfer fees based on who is claiming
    let token_mint_key = ctx.accounts.token_mint.key();
    let seeds = &[
        TOKEN_STATE_SEED,
        token_mint_key.as_ref(),
        &[ctx.bumps.token_state],
    ];
    let signer = &[&seeds[..]];

    if is_creator {
        let creator_claimable = creator_total
            .checked_sub(fee_vault.creator_claimed)
            .ok_or(LeveragedMemeError::MathOverflow)?;

        require!(creator_claimable > 0, LeveragedMemeError::InvalidAmount);

        // Transfer to creator
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.fee_vault.to_account_info(),
                to: ctx.accounts.creator_fee_account.to_account_info(),
            },
            signer,
        );
        anchor_lang::system_program::transfer(cpi_context, creator_claimable)?;

        // Update fee vault
        let fee_vault = &mut ctx.accounts.fee_vault;
        fee_vault.creator_claimed = fee_vault.creator_claimed
            .checked_add(creator_claimable)
            .ok_or(LeveragedMemeError::MathOverflow)?;

        // Emit fees claimed event
        emit!(FeesClaimed {
            token_mint: token_mint_key,
            claimer: ctx.accounts.claimant.key(),
            amount: creator_claimable,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Creator claimed {} SOL in fees", creator_claimable);
    } else {
        let protocol_claimable = protocol_total
            .checked_sub(fee_vault.protocol_claimed)
            .ok_or(LeveragedMemeError::MathOverflow)?;

        require!(protocol_claimable > 0, LeveragedMemeError::InvalidAmount);

        // Transfer to protocol
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.fee_vault.to_account_info(),
                to: ctx.accounts.protocol_fee_account.to_account_info(),
            },
            signer,
        );
        anchor_lang::system_program::transfer(cpi_context, protocol_claimable)?;

        // Update fee vault
        let fee_vault = &mut ctx.accounts.fee_vault;
        fee_vault.protocol_claimed = fee_vault.protocol_claimed
            .checked_add(protocol_claimable)
            .ok_or(LeveragedMemeError::MathOverflow)?;

        // Emit fees claimed event
        emit!(FeesClaimed {
            token_mint: token_mint_key,
            claimer: ctx.accounts.claimant.key(),
            amount: protocol_claimable,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Protocol claimed {} SOL in fees", protocol_claimable);
    }

    Ok(())
}
