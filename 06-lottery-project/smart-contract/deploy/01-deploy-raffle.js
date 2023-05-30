const { network, ethers } = require("hardhat");
const { developmentChain, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../helper-hardhat-config");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  let vrfCoordinatorV2Address, subscriptionId, VRFCoordinatorV2Mock;

  if (developmentChain.includes(network.name)) {
    VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;

    const transactionResponse = await VRFCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;

    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinator;
    subscriptionId = networkConfig[chainId].subscriptionId
  }

  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;

  const { entranceFee, gasLane } = networkConfig[chainId];
  const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmations || 1,
  })

  await VRFCoordinatorV2Mock.addConsumer(
    subscriptionId,
    raffle.address
  )

  if (!developmentChain.includes(network.name) && process.ETHERSCAN_API_KEY) {
    console.log("verifying...");
    await verify(raffle.address, args);
  }
}

module.exports.tags = ["all", "raffle"];