const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("waiting for verify...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    });
  } catch(e) {
    console.log("verify error: ", e);
  }
}

module.exports = {  
  verify
}