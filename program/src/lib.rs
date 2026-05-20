use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("GPRJg91n5fxsP9cXcdo6fsmHhUZnDFVtTr3R5ZCiQ5oq");

pub mod constants;
pub mod errors;
pub mod events;
pub mod state;
pub mod instructions;

use constants::*;
use errors::*;
use events::*;
use state::*;
use instructions::*;

#[program]
pub mod leveraged_meme {
    use super::*;

    /// Initialize a new leveraged meme token
    pub fn initialize_token(
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
        instructions::initialize_token::handler(
            ctx,
            name,
            symbol,
            uri,
            leverage,
            direction,
            underlying,
            oracle_price_at_launch,
            referrer,
        )
    }

    /// Buy tokens from the bonding curve
    pub fn buy(ctx: Context<Buy>, amount: u64) -> Result<()> {
        instructions::buy::handler(ctx, amount)
    }

    /// Sell tokens back to the bonding curve
    pub fn sell(ctx: Context<Sell>, amount: u64) -> Result<()> {
        instructions::sell::handler(ctx, amount)
    }

    /// Graduate token to Raydium AMM
    pub fn graduate(ctx: Context<Graduate>, current_oracle_price: u64) -> Result<()> {
        instructions::graduate::handler(ctx, current_oracle_price)
    }

    /// Claim accumulated fees (creator or protocol only)
    pub fn claim_fees(ctx: Context<ClaimFees>) -> Result<()> {
        instructions::claim_fees::handler(ctx)
    }

    /// Claim referral rewards (referrer only)
    pub fn claim_referral_rewards(ctx: Context<ClaimReferralRewards>) -> Result<()> {
        instructions::claim_referral_rewards::handler(ctx)
    }
}

// Re-export for IDL generation
pub use state::*;
pub use errors::*;
pub use instructions::*;
