// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to", network.name);
  
  // Deploy the FundToken first
  const FundToken = await hre.ethers.getContractFactory("FundToken");
  const fundToken = await FundToken.deploy();
  await fundToken.waitForDeployment();
  
  const fundTokenAddress = await fundToken.getAddress();
  console.log("FundToken deployed to:", fundTokenAddress);
  
  // Set distribution interval to 1 day (in seconds)
  const distributionInterval = 60 * 60 * 24; // 24 hours
  
  // Deploy MutualFundDistribution with the token address
  const MutualFundDistribution = await hre.ethers.getContractFactory("MutualFundDistribution");
  const mutualFund = await MutualFundDistribution.deploy(
    fundTokenAddress, 
    distributionInterval
  );
  await mutualFund.waitForDeployment();
  
  const mutualFundAddress = await mutualFund.getAddress();
  console.log("MutualFundDistribution deployed to:", mutualFundAddress);
  console.log("Distribution interval set to:", distributionInterval, "seconds");
  
  // For verification on Etherscan (optional)
  console.log("To verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network ${network.name} ${fundTokenAddress}`);
  console.log(`npx hardhat verify --network ${network.name} ${mutualFundAddress} ${fundTokenAddress} ${distributionInterval}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });