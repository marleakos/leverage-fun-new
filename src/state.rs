use anchor_lang::prelude::*;
use crate::errors::LeveragedMemeError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum Direction {
    Long,
    Short,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum Underlying {
    SolPerp,
    BtcPerp,
    EthPerp,
    DogePerp,
}

#[account]
pub struct TokenState {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub curve_state: CurveState,
    pub fee_vault: Pubkey,
    pub graduated: bool,
    pub amm_pool: Option<Pubkey>,
    pub created_at: i64,
    pub paused: bool,
    pub total_fees_collected: u64,
    // Leverage fields
    pub leverage: u8,
    pub direction: Direction,
    pub underlying: Underlying,
    pub oracle_price_at_launch: u64,
}

impl TokenState {
    pub const SIZE: usize = 
        32 + // creator
        32 + // token_mint
        4 + 32 + // name
        4 + 10 + // symbol
        4 + 200 + // uri
        CurveState::SIZE +
        32 + // fee_vault
        1 + // graduated
        1 + 32 + // amm_pool
        8 + // created_at
        1 + // paused
        8 + // total_fees_collected
        1 + // leverage
        1 + // direction
        1 + // underlying
        8; // oracle_price_at_launch
    
    pub fn calculate_price(&self) -> Result<u64> {
        self.curve_state.calculate_base_price()
    }
    
    pub fn market_cap(&self) -> Result<u64> {
        let price = self.calculate_price()?;
        let supply = self.curve_state.real_token_reserve;
        
        Ok((price as u128)
            .checked_mul(supply as u128)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(1_000_000)
            .ok_or(LeveragedMemeError::MathOverflow)? as u64)
    }
    
    pub fn buy_tokens(&mut self, sol_amount: u64) -> Result<u64> {
        self.curve_state.buy(sol_amount)
    }
    
    pub fn sell_tokens(&mut self, token_amount: u64) -> Result<u64> {
        self.curve_state.sell(token_amount)
    }
    
    /// Calculate leverage multiplier based on oracle price change
    /// multiplier = 1 + (leverage × price_change_pct)
    /// For LONG: positive multiplier when price goes up
    /// For SHORT: positive multiplier when price goes down
    pub fn calculate_leverage_multiplier(&self, current_oracle_price: u64) -> Result<u64> {
        if self.oracle_price_at_launch == 0 {
            return Ok(1_000_000); // 1.0 in 6 decimal precision
        }
        
        // Calculate price change percentage (6 decimal precision)
        let price_change_pct = if current_oracle_price >= self.oracle_price_at_launch {
            ((current_oracle_price as u128)
                .checked_sub(self.oracle_price_at_launch as u128)
                .ok_or(LeveragedMemeError::MathOverflow)?
                .checked_mul(1_000_000)
                .ok_or(LeveragedMemeError::MathOverflow)?
                .checked_div(self.oracle_price_at_launch as u128)
                .ok_or(LeveragedMemeError::MathOverflow)?) as i64
        } else {
            -((self.oracle_price_at_launch as u128)
                .checked_sub(current_oracle_price as u128)
                .ok_or(LeveragedMemeError::MathOverflow)?
                .checked_mul(1_000_000)
                .ok_or(LeveragedMemeError::MathOverflow)?
                .checked_div(self.oracle_price_at_launch as u128)
                .ok_or(LeveragedMemeError::MathOverflow)? as i64)
        };
        
        // Apply direction (LONG = positive, SHORT = negative)
        let directed_change = match self.direction {
            Direction::Long => price_change_pct,
            Direction::Short => -price_change_pct,
        };
        
        // Calculate multiplier: 1 + (leverage × change)
        // leverage is stored as integer (2, 3, 5, 10)
        let leverage_effect = (self.leverage as i64)
            .checked_mul(directed_change)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        // multiplier = 1_000_000 + leverage_effect
        // Floor at 1000 (0.001x) to prevent total wipeout but allow massive drawdowns
        let multiplier = 1_000_000i64
            .checked_add(leverage_effect)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        // Ensure minimum multiplier of 1000 (0.001x) - no liquidation, just near-zero
        let final_multiplier = multiplier.max(1000);
        
        Ok(final_multiplier as u64)
    }
    
    /// Calculate virtual market cap with leverage applied
    /// Used for graduation check and display
    pub fn virtual_market_cap(&self, current_oracle_price: u64) -> Result<u64> {
        let base_market_cap = self.market_cap()?;
        let multiplier = self.calculate_leverage_multiplier(current_oracle_price)?;
        
        // virtual_mcap = base_mcap × multiplier / 1_000_000
        Ok(((base_market_cap as u128)
            .checked_mul(multiplier as u128)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(1_000_000)
            .ok_or(LeveragedMemeError::MathOverflow)?) as u64)
    }
    
    /// Calculate liquidation distance percentage
    /// How far is the underlying from making this token worthless (0.001x)
    pub fn liquidation_distance(&self, current_oracle_price: u64) -> Result<u8> {
        if self.oracle_price_at_launch == 0 {
            return Ok(100); // No price set, assume safe
        }
        
        let multiplier = self.calculate_leverage_multiplier(current_oracle_price)?;
        
        // If multiplier is at floor (1000 = 0.001x), fully "liquidated"
        if multiplier <= 1000 {
            return Ok(0);
        }
        
        // Calculate how far from floor
        // distance = (multiplier - 1000) / (1_000_000 - 1000) * 100
        let distance = ((multiplier - 1000) as u128)
            .checked_mul(100)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(999_000)
            .ok_or(LeveragedMemeError::MathOverflow)? as u8;
        
        Ok(distance.min(100))
    }
    
    /// Get progress to graduation (0-100)
    pub fn graduation_progress(&self, current_oracle_price: u64) -> Result<u8> {
        use crate::constants::GRADUATION_THRESHOLD;
        let virtual_mcap = self.virtual_market_cap(current_oracle_price)?;
        
        let progress = (virtual_mcap as u128)
            .checked_mul(100)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(GRADUATION_THRESHOLD as u128)
            .ok_or(LeveragedMemeError::MathOverflow)? as u8;
        
        Ok(progress.min(100))
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct CurveState {
    pub virtual_sol_reserve: u64,
    pub virtual_token_reserve: u64,
    pub real_sol_reserve: u64,
    pub real_token_reserve: u64,
    pub k: u128,
}

impl CurveState {
    pub const SIZE: usize = 
        8 + // virtual_sol_reserve
        8 + // virtual_token_reserve
        8 + // real_sol_reserve
        8 + // real_token_reserve
        16; // k
    
    pub fn calculate_base_price(&self) -> Result<u64> {
        if self.virtual_token_reserve == 0 {
            return Ok(0);
        }
        
        Ok((self.virtual_sol_reserve as u128)
            .checked_mul(1_000_000)
            .ok_or(LeveragedMemeError::MathOverflow)?
            .checked_div(self.virtual_token_reserve as u128)
            .ok_or(LeveragedMemeError::MathOverflow)?
            as u64)
    }
    
    /// Get current price in lamports per token (with 6 decimal precision)
    pub fn get_current_price(&self) -> u64 {
        if self.virtual_token_reserve == 0 {
            return 0;
        }
        
        (self.virtual_sol_reserve as u128)
            .checked_mul(1_000_000)
            .unwrap_or(0)
            .checked_div(self.virtual_token_reserve as u128)
            .unwrap_or(0) as u64
    }
    
    pub fn buy(&mut self, sol_amount: u64) -> Result<u64> {
        let new_sol = self.virtual_sol_reserve
            .checked_add(sol_amount)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        let new_token = self.k
            .checked_div(new_sol as u128)
            .ok_or(LeveragedMemeError::MathOverflow)? as u64;
        
        let tokens_out = self.virtual_token_reserve
            .checked_sub(new_token)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        self.virtual_sol_reserve = new_sol;
        self.real_sol_reserve = self.real_sol_reserve
            .checked_add(sol_amount)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        self.virtual_token_reserve = new_token;
        self.real_token_reserve = self.real_token_reserve
            .checked_sub(tokens_out)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        Ok(tokens_out)
    }
    
    pub fn sell(&mut self, token_amount: u64) -> Result<u64> {
        let new_token = self.virtual_token_reserve
            .checked_add(token_amount)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        let new_sol = self.k
            .checked_div(new_token as u128)
            .ok_or(LeveragedMemeError::MathOverflow)? as u64;
        
        let sol_out = self.virtual_sol_reserve
            .checked_sub(new_sol)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        self.virtual_token_reserve = new_token;
        self.real_token_reserve = self.real_token_reserve
            .checked_add(token_amount)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        self.virtual_sol_reserve = new_sol;
        self.real_sol_reserve = self.real_sol_reserve
            .checked_sub(sol_out)
            .ok_or(LeveragedMemeError::MathOverflow)?;
        
        Ok(sol_out)
    }
}

#[account]
pub struct FeeVault {
    pub token_mint: Pubkey,
    pub total_collected: u64,
    pub creator_claimed: u64,
    pub protocol_claimed: u64,
    pub creator_share_bps: u64,
    // Referral system - referrer gets 10% of creator fees
    pub referrer: Option<Pubkey>,
    pub referral_rewards_total: u64,
    pub referral_rewards_claimed: u64,
}

impl FeeVault {
    pub const SIZE: usize = 
        32 + // token_mint
        8 + // total_collected
        8 + // creator_claimed
        8 + // protocol_claimed
        8 + // creator_share_bps
        1 + 32 + // referrer (Option<Pubkey>)
        8 + // referral_rewards_total
        8; // referral_rewards_claimed
}

/// User referral stats - tracks who referred this user
#[account]
pub struct UserReferral {
    pub user: Pubkey,
    pub referred_by: Option<Pubkey>,
    pub total_referral_earnings: u64,
    pub total_rewards_claimed: u64,
}

impl UserReferral {
    pub const SIZE: usize = 
        32 + // user
        1 + 32 + // referred_by (Option<Pubkey>)
        8 + // total_referral_earnings
        8; // total_rewards_claimed
}
