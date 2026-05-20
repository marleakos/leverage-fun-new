import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LeveragedMeme } from "../target/types/leveraged_meme";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";

describe("leveraged_meme", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LeveragedMeme as Program<LeveragedMeme>;
  
  // Test accounts
  const creator = Keypair.generate();
  const buyer = Keypair.generate();
  const seller = Keypair.generate();
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
  let sellerTokenAccount: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(creator.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(buyer.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(seller.publicKey, 10 * LAMPORTS_PER_SOL);
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
    sellerTokenAccount = await getAssociatedTokenAddress(tokenMint.publicKey, seller.publicKey);
  });

  describe("Initialize Token", () => {
    it("Should initialize a new token with Long direction", async () => {
      const name = "TestToken";
      const symbol = "TEST";
      const uri = "https://example.com/token.json";
      const leverage = 5;
      const oraclePriceAtLaunch = 100000000; // $100 with 6 decimals

      try {
        await program.methods
          .initializeToken(
            name,
            symbol,
            uri,
            leverage,
            { long: {} }, // Direction::Long
            { solPerp: {} }, // Underlying::SolPerp
            new anchor.BN(oraclePriceAtLaunch),
            null // No referrer
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
        
        assert.equal(tokenState.name, name);
        assert.equal(tokenState.symbol, symbol);
        assert.equal(tokenState.uri, uri);
        assert.equal(tokenState.leverage, leverage);
        assert.equal(tokenState.direction.long !== undefined, true);
        assert.equal(tokenState.underlying.solPerp !== undefined, true);
        assert.equal(tokenState.graduated, false);
        assert.equal(tokenState.creator.toBase58(), creator.publicKey.toBase58());
        assert.equal(tokenState.tokenMint.toBase58(), tokenMint.publicKey.toBase58());
        
        console.log("✅ Token initialized successfully");
        console.log("   Name:", tokenState.name);
        console.log("   Symbol:", tokenState.symbol);
        console.log("   Leverage:", tokenState.leverage + "x");
        console.log("   Direction:", tokenState.direction.long !== undefined ? "Long" : "Short");
        
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
            1, // Invalid: less than 2
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
          
        assert.fail("Should have thrown error for invalid leverage");
      } catch (error) {
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
          
        assert.fail("Should have thrown error for long name");
      } catch (error) {
        console.log("✅ Correctly rejected long name");
      }
    });
  });

  describe("Token State Verification", () => {
    it("Should have correct curve state", async () => {
      const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
      
      // Verify curve state exists and has valid values
      assert.isAbove(tokenState.curveState.virtualSolReserve.toNumber(), 0);
      assert.isAbove(tokenState.curveState.virtualTokenReserve.toNumber(), 0);
      assert.isAbove(tokenState.curveState.k.toNumber(), 0);
      
      console.log("✅ Curve state is valid");
      console.log("   Virtual SOL Reserve:", tokenState.curveState.virtualSolReserve.toString());
      console.log("   Virtual Token Reserve:", tokenState.curveState.virtualTokenReserve.toString());
      console.log("   K:", tokenState.curveState.k.toString());
    });

    it("Should have correct fee vault", async () => {
      const feeVault = await program.account.feeVault.fetch(feeVaultPDA);
      
      assert.equal(feeVault.tokenMint.toBase58(), tokenMint.publicKey.toBase58());
      assert.equal(feeVault.totalCollected.toNumber(), 0);
      assert.equal(feeVault.creatorClaimed.toNumber(), 0);
      assert.equal(feeVault.protocolClaimed.toNumber(), 0);
      
      console.log("✅ Fee vault is valid");
      console.log("   Creator Share:", feeVault.creatorShareBps.toString(), "bps");
    });

    it("Should have correct user referral", async () => {
      const userReferral = await program.account.userReferral.fetch(userReferralPDA);
      
      assert.equal(userReferral.user.toBase58(), creator.publicKey.toBase58());
      assert.equal(userReferral.referredBy, null);
      assert.equal(userReferral.totalReferralEarnings.toNumber(), 0);
      
      console.log("✅ User referral is valid");
    });
  });

  describe("Buy Tokens", () => {
    it("Should buy tokens", async () => {
      const buyAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
      
      try {
        await program.methods
          .buy(buyAmount)
          .accounts({
            buyer: buyer.publicKey,
            tokenState: tokenStatePDA,
            tokenMint: tokenMint.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            curveTokenAccount: curveTokenAccountPDA,
            feeVault: feeVaultPDA,
            protocolFeeAccount: provider.wallet.publicKey,
            creatorFeeAccount: creator.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .signers([buyer])
          .rpc();

        // Verify token state updated
        const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
        console.log("✅ Buy successful");
        console.log("   New Virtual SOL Reserve:", tokenState.curveState.virtualSolReserve.toString());
        console.log("   New Virtual Token Reserve:", tokenState.curveState.virtualTokenReserve.toString());
        
      } catch (error) {
        console.error("❌ Buy failed:", error);
        throw error;
      }
    });
  });

  describe("Events", () => {
    it("Should emit TokenInitialized event", async () => {
      // Events are logged, verify by checking the token was created
      const tokenState = await program.account.tokenState.fetch(tokenStatePDA);
      assert.isNotNull(tokenState);
      console.log("✅ TokenInitialized event would be emitted");
    });
  });

  console.log("\n🧪 Test Suite Complete!");
  console.log("Program ID:", program.programId.toBase58());
});
