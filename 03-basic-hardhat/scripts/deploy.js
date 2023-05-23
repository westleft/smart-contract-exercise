// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const simpleAmount = hre.ethers.utils.parseEther("0.001");

  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  // console.log(hre.network.config)

  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  console.log(
    `simpleStorage with ${ethers.utils.formatEther(
      simpleAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${simpleStorage.address}`
  );

  const currentValue = await simpleStorage.retrieve();
  console.log("currentValue", currentValue.toString());

  const response = await simpleStorage.store(7);
  await response.wait(1);

  const changedValue = await simpleStorage.retrieve();
  console.log("changedValue", changedValue.toString());
}

async function verify(contractAddress, args) {
  console.log("waiting for verify...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructArguments: args
    });
  } catch(e) {
    console.log("verify error: ", e);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
