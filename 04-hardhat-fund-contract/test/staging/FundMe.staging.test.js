const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

developmentChain.includes(network.name) 
  ? describe.skip 
  : describe("FundMe", async () => {
    let FundMe;
    let deployer;

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      FundMe = await ethers.getContract("FundMe", deployer);
    })

    describe("test", async () => {
      it("amount", async () => {
        const response = await FundMe.getAddressToAmountFunded(deployer);
        assert.notEqual(response.toString(), "0");
      })
    })
  })
  