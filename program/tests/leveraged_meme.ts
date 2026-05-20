import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

describe("leveraged_meme", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;
  
  // Test accounts
  const creator = Keypair.generate();
  const buyer = Keypair.generate();
  const referrer = Keypair.generate();
  
  // Token mint keypair
  const tokenMint = Keypair.generate();
  
  // PDA addresses
  let tokenStatePDA: PublicKey;
  let feeVaultPDA: PublicKey;
  let userReferralPDA: PublicKey;
  let curveTokenAccountPDA: PublicKey;
  let lpTokenAccountPDA: PublicKey;
  
  // Token accounts
  let creatorTokenAccount: PublicKey;
  let buyerTokenAccount: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(creator.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(buyer.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(referrer.publicKey, 1 * LAMPORTS_PER_SOL);
    
    // Wait for airdrop confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Derive PDAs
    [tokenStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_state"), tokenMint.publicKey.toBuffer()],
      program.programId
    );
    
    [feeVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("fee_vault"), tokenMint.publicKey.toBuffer()],
      program.programId
    );
    
    [userReferralPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_referral"), creator.publicKey.toBuffer()],
      program.programId
    );
    
    [curveTokenAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("curve_token"), tokenMint.publicKey.toBuffer()],
      program.programId
    );
    
    [lpTokenAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_token"), tokenMint.publicKey.toBuffer()],
      program.programId
    );

    // Get associated token accounts
    creatorTokenAccount = await getAssociatedTokenAddress(tokenMint.publicKey, creator.publicKey);
    buyerTokenAccount = await getAssociatedTokenAddress(tokenMint.publicKey, buyer.publicKey);
  });

  describe("Initialize Token", () => {
    it("Should initialize a new token with Long direction", async () => {
      const name = "TestToken";
      const symbol = "TEST";
      const uri = "https://example.com/token.json";
      const leverage = 5;
      const oraclePriceAtLaunch = 100000000;

      try {
        await program.methods
          .initializeToken(
            name,
            symbol,
            uri,
            leverage,
            { long: {} },
            { solPerp: {} },
            new anchor.BN(oraclePriceAtLaunch),
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

        // Fetch and verify token state
        const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
        
        if (tokenState.name !== name) throw new Error("Name mismatch");
        if (tokenState.symbol !== symbol) throw new Error("Symbol mismatch");
        if (tokenState.leverage !== leverage) throw new Error("Leverage mismatch");
        if (tokenState.direction.long === undefined) throw new Error("Direction should be Long");
        if (tokenState.graduated !== false) throw new Error("Should not be graduated");
        
        console.log("✅ Token initialized successfully");
        console.log("   Name:", tokenState.name);
        console.log("   Symbol:", tokenState.symbol);
        console.log("   Leverage:", tokenState.leverage + "x");
        
      } catch (error) {
        console.error("❌ Failed to initialize token:", error);
        throw error;
      }
    });

    it("Should fail with invalid leverage (too low)", async () => {
      const testMint = Keypair.generate();
      
      try {
        await program.methods
          .initializeToken(
            "BadToken",
            "BAD",
            "https://example.com/bad.json",
            1,
            { long: {} },
            { solPerp: {} },
            new anchor.BN(100000000),
            null
          )
          .accounts({
            creator: creator.publicKey,
            tokenMint: testMint.publicKey,
            tokenState: PublicKey.findProgramAddressSync(
              [Buffer.from("token_state"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            feeVault: PublicKey.findProgramAddressSync(
              [Buffer.from("fee_vault"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            userReferral: PublicKey.findProgramAddressSync(
              [Buffer.from("user_referral"), creator.publicKey.toBuffer()],
              program.programId
            )[0],
            curveTokenAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("curve_token"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            lpTokenAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("lp_token"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .signers([creator, testMint])
          .rpc();
          
        throw new Error("Should have failed with invalid leverage");
      } catch (error) {
        if (error.message.includes("Should have failed")) throw error;
        console.log("✅ Correctly rejected invalid leverage");
      }
    });

    it("Should fail with name too long", async () => {
      const testMint = Keypair.generate();
      
      try {
        await program.methods
          .initializeToken(
            "ThisNameIsWayTooLongAndShouldFailTheValidationCheck",
            "BAD",
            "https://example.com/bad.json",
            5,
            { long: {} },
            { solPerp: {} },
            new anchor.BN(100000000),
            null
          )
          .accounts({
            creator: creator.publicKey,
            tokenMint: testMint.publicKey,
            tokenState: PublicKey.findProgramAddressSync(
              [Buffer.from("token_state"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            feeVault: PublicKey.findProgramAddressSync(
              [Buffer.from("fee_vault"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            userReferral: PublicKey.findProgramAddressSync(
              [Buffer.from("user_referral"), creator.publicKey.toBuffer()],
              program.programId
            )[0],
            curveTokenAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("curve_token"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            lpTokenAccount: PublicKey.findProgramAddressSync(
              [Buffer.from("lp_token"), testMint.publicKey.toBuffer()],
              program.programId
            )[0],
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .signers([creator, testMint])
          .rpc();
          
        throw new Error("Should have failed with long name");
      } catch (error) {
        if (error.message.includes("Should have failed")) throw error;
        console.log("✅ Correctly rejected long name");
      }
    });
  });

  describe("Token State Verification", () => {
    it("Should have correct curve state", async () => {
      const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
      
      if (tokenState.curveState.virtualSolReserve.toNumber() <= 0) {
        throw new Error("Virtual SOL reserve should be > 0");
      }
      if (tokenState.curveState.virtualTokenReserve.toNumber() <= 0) {
        throw new Error("Virtual token reserve should be > 0");
      }
      
      console.log("✅ Curve state is valid");
      console.log("   Virtual SOL Reserve:", tokenState.curveState.virtualSolReserve.toString());
      console.log("   Virtual Token Reserve:", tokenState.curveState.virtualTokenReserve.toString());
    });

    it("Should have correct fee vault", async () => {
      const feeVault = await program.account.feeVault.fetch(feeVaultPDA);
      
      if (feeVault.tokenMint.toBase58() !== tokenMint.publicKey.toBase58()) {
        throw new Error("Fee vault token mint mismatch");
      }
      
      console.log("✅ Fee vault is valid");
    });
  });

  console.log("\n🧪 Test Suite Ready!");
  console.log("Program ID:", program.programId.toBase58());
});
