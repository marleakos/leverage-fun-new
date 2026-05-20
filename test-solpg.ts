// Test script for Solana Playground
// This tests the initializeToken instruction

import { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

const PROGRAM_ID = new PublicKey("BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA")
const RPC_URL = "https://api.devnet.solana.com"

// Discriminator for initialize_token
const INITIALIZE_TOKEN_DISCRIMINATOR = new Uint8Array([38, 209, 150, 50, 190, 117, 16, 54])

async function testInitializeToken() {
  const connection = new Connection(RPC_URL, "confirmed")
  
  // You'll need to provide your wallet keypair here
  // const wallet = Keypair.fromSecretKey(new Uint8Array([/* your secret key */]))
  
  const mintKeypair = Keypair.generate()
  const curveTokenKeypair = Keypair.generate()
  const lpTokenKeypair = Keypair.generate()
  
  console.log("Mint:", mintKeypair.publicKey.toString())
  console.log("Curve Token:", curveTokenKeypair.publicKey.toString())
  console.log("LP Token:", lpTokenKeypair.publicKey.toString())
  
  // Get PDAs
  const [tokenStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_state"), mintKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  )
  const [feeVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("fee_vault"), mintKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  )
  
  console.log("Token State PDA:", tokenStatePDA.toString())
  console.log("Fee Vault PDA:", feeVaultPDA.toString())
  
  // Build instruction data
  const data = Buffer.alloc(1000)
  let offset = 0
  
  // Discriminator
  data.set(INITIALIZE_TOKEN_DISCRIMINATOR, offset)
  offset += 8
  
  // Name (string)
  const nameBytes = Buffer.from("Test Token")
  data.writeUInt32LE(nameBytes.length, offset)
  offset += 4
  nameBytes.copy(data, offset)
  offset += nameBytes.length
  
  // Symbol (string)
  const symbolBytes = Buffer.from("TEST")
  data.writeUInt32LE(symbolBytes.length, offset)
  offset += 4
  symbolBytes.copy(data, offset)
  offset += symbolBytes.length
  
  // URI (string)
  const uriBytes = Buffer.from("https://example.com/metadata.json")
  data.writeUInt32LE(uriBytes.length, offset)
  offset += 4
  uriBytes.copy(data, offset)
  offset += uriBytes.length
  
  // Leverage (u8)
  data.writeUInt8(5, offset)
  offset += 1
  
  // Direction enum (u8: 0 = Long, 1 = Short)
  data.writeUInt8(0, offset) // Long
  offset += 1
  
  // Underlying enum (u8: 0 = SolPerp, 1 = BtcPerp, 2 = EthPerp, 3 = DogePerp)
  data.writeUInt8(0, offset) // SolPerp
  offset += 1
  
  // Oracle price (u64)
  const oraclePrice = BigInt(1000000000)
  const priceBytes = new Uint8Array(8)
  const priceView = new DataView(priceBytes.buffer)
  priceView.setBigUint64(0, oraclePrice, true)
  data.set(priceBytes, offset)
  offset += 8
  
  // Referrer (Option<Pubkey>) - 0 = None
  data.writeUInt8(0, offset)
  offset += 1

  const instructionData = data.slice(0, offset)
  
  console.log("Instruction data length:", instructionData.length)
  console.log("Instruction data:", Array.from(instructionData).map(b => b.toString(16).padStart(2, '0')).join(' '))
  
  // This would be the instruction - but we need a wallet to actually send it
  console.log("\nTo test this on Solana Playground:")
  console.log("1. Import this code")
  console.log("2. Add your wallet keypair")
  console.log("3. Run the test")
}

testInitializeToken().catch(console.error)
