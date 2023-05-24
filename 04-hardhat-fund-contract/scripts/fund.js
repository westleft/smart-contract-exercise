const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  FundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding...");

  const transactionResponse = await FundMe.fund({value: ethers.utils.parseEther("0.1")});
  await transactionResponse.wait(1);
  console.log("funded!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
