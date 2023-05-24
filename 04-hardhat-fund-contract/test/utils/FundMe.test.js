const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

!developmentChain.includes(network.name) 
  ? describe.skip 
  : describe("FundMe", async () => {
      let FundMe;
      let deployer;
      let mockV3Aggregator;
      const senderValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        // 部屬者 account
        deployer = (await getNamedAccounts()).deployer;

        // 部屬合約
        await deployments.fixture(["all"]);
        FundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
      });

      describe("constructor", async () => {
        it("check address", async () => {
          const response = await FundMe.getPriceFeed();

          assert.equal(response, mockV3Aggregator.address);
        })
      })

      describe("fund", async () => {
        it("enough ETH", async () => {
          await expect(FundMe.fund()).to.be.revertedWith("you need send more ETH");
        })

        it("update amount", async () => {
          await FundMe.fund({value: senderValue});

          const response = await FundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), senderValue.toString());
        })

        it("add funder to array", async () => {
          await FundMe.fund({value: senderValue});

          const funder = await FundMe.getFunder(0);
          assert.equal(funder, deployer);      
        })
      })

      describe("withdraw", async () => {
        beforeEach(async () => {
          await FundMe.fund({value: senderValue});
        })

        it("withdraw ETH", async () => {
          const startDeployerBalance = await FundMe.provider.getBalance(deployer);
          const startFundMeBalance = await FundMe.provider.getBalance(FundMe.address);

          const transactionResponse = await FundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          // gas fee
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          
          const endingDeployerBalance = await FundMe.provider.getBalance(deployer);
          const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address);

          assert.equal(endingFundMeBalance, 0);

          assert.equal(
            startFundMeBalance.add(startDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("allow owner withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await FundMe.connect(attacker);
          
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
      })
    })
