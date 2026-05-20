use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::{
    constants::*,
    errors::LeveragedMemeError,
    state::*,
};

#[derive(Accounts)]
pub struct SetPause<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [
            TOKEN_STATE_SEED,
            token_mint.key().as_ref(),
        ],
        bump,
        has_one = creator @ LeveragedMemeError::Unauthorized
    )]
    pub token_state: Account<'info, TokenState>,
    
    /// CHECK: Creator of the token
    pub creator: AccountInfo<'info>,
    
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
}

pub fn handler(ctx: Context<SetPause>, paused: bool) -> Result<()> {
    let token_state = &mut ctx.accounts.token_state;
    token_state.paused = paused;
    
    if paused {
        msg!("Token trading paused");
    } else {
        msg!("Token trading unpaused");
    }
    
    Ok(())
}
