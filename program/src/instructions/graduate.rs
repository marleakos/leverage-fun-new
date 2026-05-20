use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    events::TokenGraduated,
    state::*,
};

#[derive(Accounts)]
pub struct Graduate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

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

    /// CHECK: Pyth oracle account for the underlying
    pub pyth_oracle: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<Graduate>, current_oracle_price: u64) -> Result<()> {
    let token_state = &mut ctx.accounts.token_state;

    require!(!token_state.graduated, LeveragedMemeError::AlreadyGraduated);

    // Check graduation threshold using VIRTUAL market cap (with leverage)
    let virtual_market_cap = token_state.virtual_market_cap(current_oracle_price)?;
    require!(
        virtual_market_cap >= GRADUATION_THRESHOLD,
        LeveragedMemeError::GraduationThresholdNotMet
    );

    token_state.graduated = true;

    // Emit graduation event
    emit!(TokenGraduated {
        token_mint: ctx.accounts.token_mint.key(),
        final_market_cap: virtual_market_cap,
        timestamp: ctx.accounts.clock.unix_timestamp,
    });

    msg!("Token graduated! Virtual market cap: {}", virtual_market_cap);

    Ok(())
}
