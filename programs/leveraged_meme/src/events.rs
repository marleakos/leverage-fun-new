use anchor_lang::prelude::*;

/// Event emitted when a token is bought
#[event]
pub struct TokenBought {
    pub token_mint: Pubkey,
    pub buyer: Pubkey,
    pub sol_amount: u64,
    pub tokens_received: u64,
    pub price: u64,
    pub timestamp: i64,
}

/// Event emitted when a token is sold
#[event]
pub struct TokenSold {
    pub token_mint: Pubkey,
    pub seller: Pubkey,
    pub sol_amount: u64,
    pub tokens_sold: u64,
    pub price: u64,
    pub timestamp: i64,
}

/// Event emitted when a token graduates
#[event]
pub struct TokenGraduated {
    pub token_mint: Pubkey,
    pub final_market_cap: u64,
    pub timestamp: i64,
}

/// Event emitted when fees are claimed
#[event]
pub struct FeesClaimed {
    pub token_mint: Pubkey,
    pub claimer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

/// Event emitted when a token is initialized
#[event]
pub struct TokenInitialized {
    pub token_mint: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub symbol: String,
    pub leverage: u8,
    pub direction: u8,
    pub underlying: u8,
    pub timestamp: i64,
}

/// Event emitted when referral rewards are claimed
#[event]
pub struct ReferralRewardsClaimed {
    pub token_mint: Pubkey,
    pub referrer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
