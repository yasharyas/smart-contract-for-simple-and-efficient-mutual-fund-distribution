// Alternative: Converting hardhat.config.js to CommonJS
const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");

const config = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/f1RKNQ3CMA40Vz9j4f7d7GAC9n_ONGnw",
      accounts: ["0xaf16be72c82e9868a926f8f3cf0df1135fb1fad181c11dea1b27d971cb695f8a"],
    },
  },
};

module.exports = config;

//FundToken deployed to: 0x9942beBcBc52D6B8072051Fb08504932C72e2da5
// MutualFundDistribution deployed to: 0x9E6C48038fE0901c7c04730c8a35121c52ae303f