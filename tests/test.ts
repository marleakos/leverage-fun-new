import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;

// Use the wallet from provider (already has SOL)
const creator = provider.wallet;

// Token mint
const tokenMint = Keypair.generate();

// PDAs
const [tokenStatePDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_state"), tokenMint.publicKey.toBuffer()],
  program.programId
);

const [feeVaultPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("fee_vault"), tokenMint.publicKey.toBuffer()],
  program.programId
);

const [userReferralPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("user_referral"), creator.publicKey.toBuffer()],
  program.programId
);

const [curveTokenAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("curve_token"), tokenMint.publicKey.toBuffer()],
  program.programId
);

const [lpTokenAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("lp_token"), tokenMint.publicKey.toBuffer()],
  program.programId
);

// Run test
console.log("Testing initialize_token...");
console.log("Creator:", creator.publicKey.toBase58());

// Check balance
const balance = await provider.connection.getBalance(creator.publicKey);
console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

if (balance < LAMPORTS_PER_SOL) {
  console.error("❌ Not enough SOL. Need at least 1 SOL.");
  console.error("Get devnet SOL from: https://faucet.solana.com");
} else {
  try {
    await program.methods
      .initializeToken(
        "TestToken",
        "TEST", 
        "https://example.com/token.json",
        5,
        { long: {} },
        { solPerp: {} },
        new anchor.BN(100000000),
        null
      )
      .accounts({
        creator: creator.publicKey,
        tokenMint: tokenMint.publicKey,
        tokenState: tokenStatePDA,
        feeVault: feeVaultPDA,
        userReferral: userReferralPDA,
        curveTokenAccount: curveTokenAccountPDA,
        lpTokenAccount: lpTokenAccountPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([tokenMint])
      .rpc();

    console.log("✅ SUCCESS: Token initialized!");
    
    const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
    console.log("Name:", tokenState.name);
    console.log("Symbol:", tokenState.symbol);
    console.log("Leverage:", tokenState.leverage);
    
  } catch (error) {
    console.error("❌ FAILED:", error);
  }
}
