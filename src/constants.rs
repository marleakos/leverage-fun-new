use anchor_lang::prelude::*;

pub const TOKEN_DECIMALS: u8 = 6;
pub const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000;
pub const CURVE_RESERVE_AMOUNT: u64 = TOTAL_SUPPLY * 75 / 100;
pub const LP_RESERVE_AMOUNT: u64 = TOTAL_SUPPLY * 25 / 100;
pub const VIRTUAL_SOL_SEED: u64 = 4_000_000_000;
pub const GRADUATION_THRESHOLD: u64 = 69_000_000_000;
pub const DEPLOY_FEE: u64 = 100_000_000;

// Fee structure
pub const TRADING_FEE_BPS: u64 = 50; // 0.5% base trading fee
pub const PROTOCOL_FEE_SHARE: u64 = 50; // 50% of trading fees
pub const CREATOR_FEE_SHARE: u64 = 50; // 50% of trading fees

// Leverage fee tiers (additional fee based on leverage)
pub const LEVERAGE_FEE_2X_BPS: u64 = 10;  // 0.1% additional
pub const LEVERAGE_FEE_3X_BPS: u64 = 20;  // 0.2% additional
pub const LEVERAGE_FEE_5X_BPS: u64 = 30;  // 0.3% additional
pub const LEVERAGE_FEE_10X_BPS: u64 = 50; // 0.5% additional

// Referral system - referrer gets 10% of creator fees
pub const REFERRAL_SHARE_BPS: u64 = 1000; // 10% of creator's share

pub const TOKEN_STATE_SEED: &[u8] = b"token_state";
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";
pub const USER_REFERRAL_SEED: &[u8] = b"user_referral";
