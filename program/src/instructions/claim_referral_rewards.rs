use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    events::ReferralRewardsClaimed,
    state::*,
};

#[derive(Accounts)]
pub struct ClaimReferralRewards<'info> {
    #[account(mut)]
    pub referrer: Signer<'info>,

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

    /// CHECK: Referrer's wallet to receive rewards
    #[account(mut)]
    pub referrer_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimReferralRewards>) -> Result<()> {
    let fee_vault = &ctx.accounts.fee_vault;
    let referrer_key = ctx.accounts.referrer.key();

    // Verify caller is the registered referrer for this token
    require!(
        fee_vault.referrer == Some(referrer_key),
        LeveragedMemeError::Unauthorized
    );

    // Calculate claimable referral rewards
    let claimable = fee_vault.referral_rewards_total
        .checked_sub(fee_vault.referral_rewards_claimed)
        .ok_or(LeveragedMemeError::MathOverflow)?;

    require!(claimable > 0, LeveragedMemeError::InvalidAmount);

    // Transfer rewards to referrer
    let token_mint_key = ctx.accounts.token_mint.key();
    let seeds = &[
        TOKEN_STATE_SEED,
        token_mint_key.as_ref(),
        &[ctx.bumps.token_state],
    ];
    let signer = &[&seeds[..]];

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.fee_vault.to_account_info(),
            to: ctx.accounts.referrer_wallet.to_account_info(),
        },
        signer,
    );
    anchor_lang::system_program::transfer(cpi_context, claimable)?;

    // Update fee vault
    let fee_vault = &mut ctx.accounts.fee_vault;
    fee_vault.referral_rewards_claimed = fee_vault.referral_rewards_claimed
        .checked_add(claimable)
        .ok_or(LeveragedMemeError::MathOverflow)?;

    // Emit referral rewards claimed event
    emit!(ReferralRewardsClaimed {
        token_mint: token_mint_key,
        referrer: referrer_key,
        amount: claimable,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Referrer claimed {} SOL in referral rewards", claimable);

    Ok(())
}
