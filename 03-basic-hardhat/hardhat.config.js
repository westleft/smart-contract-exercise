require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/block-numbers");
require("hardhat-gas-reporter");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt" ,
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COIN_MARKET_API_KEY,
    // token: "MATIC"
  },
  solidity: "0.8.18",
};
