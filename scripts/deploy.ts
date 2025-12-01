import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log('🚀 Deploying FarcasterConstellationNFT to Base...\n');

    // Environment variables
    const RPC_URL = process.env.BASE_RPC_URL;
    const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

    if (!RPC_URL || !PRIVATE_KEY) {
        throw new Error('Missing environment variables. Check .env.local');
    }

    // Provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('📝 Deployer address:', wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');

    if (balance === 0n) {
        throw new Error('Insufficient balance. Please fund your deployer wallet.');
    }

    // Read compiled contract
    // Note: You'll need to compile the contract first using Hardhat or Foundry
    // This is a simplified version assuming you have the ABI and bytecode

    console.log('⚠️  IMPORTANT: Before running this script:');
    console.log('1. Compile your Solidity contract using Hardhat or Foundry');
    console.log('2. Place the compiled ABI and bytecode in the contracts/compiled/ directory');
    console.log('3. Or use Remix to compile and deploy manually\n');

    console.log('🔗 Network:', await provider.getNetwork());
    console.log('\n✅ Setup complete. Ready to deploy when contract is compiled.');

  // Deployment example (uncomment when you have compiled contract):
  /*
  const contractJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../contracts/compiled/FarcasterConstellationNFT.json'), 'utf8')
  );
  
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  console.log('🏗️  Deploying contract...');
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contract deployed to:', contractAddress);
  
  // Save contract address to .env
  const envPath = path.join(__dirname, '../.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(
    /NFT_CONTRACT_ADDRESS=.*/,
    `NFT_CONTRACT_ADDRESS=${contractAddress}`
  );
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Contract address saved to .env.local');
  */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
