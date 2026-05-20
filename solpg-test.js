// Copy this into Solana Playground (beta.solpg.io)
// Test the initializeToken instruction

const PROGRAM_ID = new solanaWeb3.PublicKey("BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA");

// Discriminator for initialize_token (sha256("global:initialize_token")[0:8])
const DISCRIMINATOR = new Uint8Array([38, 209, 150, 50, 190, 117, 16, 54]);

async function testInitialize() {
  console.log("Testing initializeToken...");
  
  // Generate keypairs
  const mint = solanaWeb3.Keypair.generate();
  const curveToken = solanaWeb3.Keypair.generate();
  const lpToken = solanaWeb3.Keypair.generate();
  
  console.log("Mint:", mint.publicKey.toString());
  
  // Get PDAs
  const [tokenState] = solanaWeb3.PublicKey.findProgramAddressSync(
    [Buffer.from("token_state"), mint.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const [feeVault] = solanaWeb3.PublicKey.findProgramAddressSync(
    [Buffer.from("fee_vault"), mint.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const [userReferral] = solanaWeb3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_referral"), pg.wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  
  // Build instruction data
  const name = Buffer.from("TestToken");
  const symbol = Buffer.from("TEST");
  const uri = Buffer.from("https://example.com");
  
  const data = Buffer.alloc(200);
  let offset = 0;
  
  // Discriminator
  data.set(DISCRIMINATOR, offset);
  offset += 8;
  
  // Name (string: 4 bytes length + data)
  data.writeUInt32LE(name.length, offset);
  offset += 4;
  name.copy(data, offset);
  offset += name.length;
  
  // Symbol
  data.writeUInt32LE(symbol.length, offset);
  offset += 4;
  symbol.copy(data, offset);
  offset += symbol.length;
  
  // URI
  data.writeUInt32LE(uri.length, offset);
  offset += 4;
  uri.copy(data, offset);
  offset += uri.length;
  
  // Leverage (u8)
  data.writeUInt8(5, offset);
  offset += 1;
  
  // Direction (u8: 0=Long, 1=Short)
  data.writeUInt8(0, offset);
  offset += 1;
  
  // Underlying (u8: 0=Sol, 1=Btc, 2=Eth, 3=Doge)
  data.writeUInt8(0, offset);
  offset += 1;
  
  // Oracle price (u64)
  const price = BigInt(1000000000);
  const priceBytes = new Uint8Array(8);
  new DataView(priceBytes.buffer).setBigUint64(0, price, true);
  data.set(priceBytes, offset);
  offset += 8;
  
  // Referrer (Option: 0 = None)
  data.writeUInt8(0, offset);
  offset += 1;
  
  const ixData = data.slice(0, offset);
  
  // Create instruction
  const ix = new solanaWeb3.TransactionInstruction({
    keys: [
      { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: mint.publicKey, isSigner: true, isWritable: true },
      { pubkey: tokenState, isSigner: false, isWritable: true },
      { pubkey: feeVault, isSigner: false, isWritable: true },
      { pubkey: userReferral, isSigner: false, isWritable: true },
      { pubkey: curveToken.publicKey, isSigner: true, isWritable: true },
      { pubkey: lpToken.publicKey, isSigner: true, isWritable: true },
      { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
      { pubkey: solanaWeb3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: solanaWeb3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: ixData,
  });
  
  // Send transaction
  const tx = new solanaWeb3.Transaction().add(ix);
  tx.feePayer = pg.wallet.publicKey;
  
  // Sign with all signers
  tx.sign(mint, curveToken, lpToken);
  
  try {
    const signature = await pg.connection.sendTransaction(tx, [pg.wallet.keypair, mint, curveToken, lpToken]);
    console.log("Success! Signature:", signature);
    await pg.connection.confirmTransaction(signature);
    console.log("Confirmed!");
  } catch (e) {
    console.error("Error:", e);
  }
}

testInitialize();
