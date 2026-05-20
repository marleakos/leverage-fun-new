import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;

// Test accounts
const creator = Keypair.generate();
const buyer = Keypair.generate();

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

// Test 1: Initialize token
console.log("\n🧪 Test 1: Initialize Token");
console.log("============================");

try {
  // Airdrop SOL to creator
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

  console.log("✅ Token initialized successfully!");
  
  // Verify token state
  const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
  console.log("   Name:", tokenState.name);
  console.log("   Symbol:", tokenState.symbol);
  console.log("   Leverage:", tokenState.leverage + "x");
  console.log("   Direction:", tokenState.direction.long !== undefined ? "Long" : "Short");
  
} catch (error) {
  console.error("❌ Failed to initialize token:");
  console.error(error);
}

// Test 2: Verify curve state
console.log("\n🧪 Test 2: Verify Curve State");
console.log("==============================");

try {
  const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
  
  if (tokenState.curveState.virtualSolReserve.toNumber() > 0 &&
      tokenState.curveState.virtualTokenReserve.toNumber() > 0) {
    console.log("✅ Curve state is valid!");
    console.log("   Virtual SOL Reserve:", tokenState.curveState.virtualSolReserve.toString());
    console.log("   Virtual Token Reserve:", tokenState.curveState.virtualTokenReserve.toString());
  } else {
    console.log("❌ Curve state has invalid values");
  }
} catch (error) {
  console.error("❌ Failed to fetch curve state:");
  console.error(error);
}

// Test 3: Verify fee vault
console.log("\n🧪 Test 3: Verify Fee Vault");
console.log("============================");

try {
  const feeVault = await program.account.feeVault.fetch(feeVaultPDA);
  
  if (feeVault.tokenMint.toBase58() === tokenMint.publicKey.toBase58()) {
    console.log("✅ Fee vault is valid!");
    console.log("   Token Mint:", feeVault.tokenMint.toBase58().slice(0, 8) + "...");
    console.log("   Total Collected:", feeVault.totalCollected.toString());
  } else {
    console.log("❌ Fee vault token mint mismatch");
  }
} catch (error) {
  console.error("❌ Failed to fetch fee vault:");
  console.error(error);
}

// Test 4: Try invalid leverage
console.log("\n🧪 Test 4: Invalid Leverage (should fail)");
console.log("==========================================");

try {
  const badMint = Keypair.generate();
  const [badTokenState] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_state"), badMint.publicKey.toBuffer()],
    program.programId
  );
  const [badFeeVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("fee_vault"), badMint.publicKey.toBuffer()],
    program.programId
  );
  const [badUserReferral] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_referral"), creator.publicKey.toBuffer()],
    program.programId
  );
  const [badCurveToken] = PublicKey.findProgramAddressSync(
    [Buffer.from("curve_token"), badMint.publicKey.toBuffer()],
    program.programId
  );
  const [badLpToken] = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_token"), badMint.publicKey.toBuffer()],
    program.programId
  );

  await program.methods
    .initializeToken(
      "BadToken",
      "BAD",
      "https://example.com/bad.json",
      1, // Invalid: less than 2
      { long: {} },
      { solPerp: {} },
      new anchor.BN(100000000),
      null
    )
    .accounts({
      creator: creator.publicKey,
      tokenMint: badMint.publicKey,
      tokenState: badTokenState,
      feeVault: badFeeVault,
      userReferral: badUserReferral,
      curveTokenAccount: badCurveToken,
      lpTokenAccount: badLpToken,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .signers([creator, badMint])
    .rpc();
    
  console.log("❌ Should have failed with invalid leverage!");
} catch (error) {
  console.log("✅ Correctly rejected invalid leverage!");
}

console.log("\n✨ All tests completed!");
console.log("Program ID:", program.programId.toBase58());
