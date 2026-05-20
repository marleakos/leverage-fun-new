import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;

// Test accounts
const creator = Keypair.generate();

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

try {
  await provider.connection.requestAirdrop(creator.publicKey, 10 * LAMPORTS_PER_SOL);
  await new Promise(resolve => setTimeout(resolve, 1000));

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
    .signers([creator, tokenMint])
    .rpc();

  console.log("✅ SUCCESS: Token initialized!");
  
  const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
  console.log("Name:", tokenState.name);
  console.log("Symbol:", tokenState.symbol);
  
} catch (error) {
  console.error("❌ FAILED:", error);
}
