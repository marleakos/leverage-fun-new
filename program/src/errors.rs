use anchor_lang::prelude::*;

#[error_code]
pub enum LeveragedMemeError {
    #[msg("Name too long (max 32 characters)")]
    NameTooLong,

    #[msg("Symbol too long (max 10 characters)")]
    SymbolTooLong,

    #[msg("Token already graduated")]
    AlreadyGraduated,

    #[msg("Insufficient liquidity in curve")]
    InsufficientLiquidity,

    #[msg("Graduation threshold not reached")]
    GraduationThresholdNotMet,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Invalid leverage (must be 2-10)")]
    InvalidLeverage,
}
