import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Configure the client to use the local cluster.
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;

// Use the wallet from the provider (already has SOL from the local validator)
const wallet = provider.wallet;

async function main() {
  console.log("Wallet:", wallet.publicKey.toBase58());
  
  const balance = await provider.connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log("Low balance, skipping test");
    return;
  }

  const tokenMint = Keypair.generate();

  const [tokenStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_state"), tokenMint.publicKey.toBuffer()],
    program.programId
  );

  const [feeVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("fee_vault"), tokenMint.publicKey.toBuffer()],
    program.programId
  );

  const [userReferralPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_referral"), wallet.publicKey.toBuffer()],
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

  console.log("Creating token...");

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
      creator: wallet.publicKey,
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

  console.log("✅ Token created successfully!");

  const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
  console.log("Token Name:", tokenState.name);
  console.log("Token Symbol:", tokenState.symbol);
}

main().catch(console.error);
