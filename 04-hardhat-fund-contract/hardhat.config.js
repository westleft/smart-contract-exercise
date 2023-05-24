require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      { version: "0.8.18" },
      { version: "0.6.6" },
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    users: {
      default: 0
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt" ,
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COIN_MARKET_API_KEY,
    // token: "MATIC"
  },
};
