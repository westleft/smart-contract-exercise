const { network, ethers } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");

const BASE_FEE = ethers.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChain.includes(network.name)) {
    console.log("local network deploying ...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args
    })
  }

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmation: network.config.blockConfirmations || 1,
  })
}