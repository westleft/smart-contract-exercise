const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChain, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("Raffle unit test", () => {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval, player;
    const chainId = network.config.chainId;

    beforeEach(async () => {
      accounts = await ethers.getSigners() // could also do with getNamedAccounts
      //   deployer = accounts[0]
      player = accounts[1]
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      raffle = await ethers.getContract("Raffle", deployer);
      vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
      raffleEntranceFee = await raffle.getEntranceFee();
      interval = await raffle.getInterval();
    })

    describe("constructor", () => {
      it("init the raffle correctly", async () => {
        const raffleState = await raffle.getRaffleState();
        assert.equal(raffleState.toString(), "0");
        assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
      })
    })

    describe("enter Raffle", () => {
      it("reverts pay enough", async () => {
        await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered")
      })

      it("records players when they enter", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        const playerFromContract = await raffle.getPlayer(0);
        assert.equal(playerFromContract, deployer);
      })

      it("emit event on enter", async () => {
        await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter");
      })

      it("raffle is calculating", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
        await network.provider.send("evm_mine", []);
        await raffle.performUpkeep([]);
        await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
      })
    })

    describe("checkUpkeep", () => {
      it("returns false if won't send ETH", async () => {
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
        await network.provider.send("evm_mine", []);
        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert(!upkeepNeeded);

      })

      it("returns false if raffle isn't open", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
        await network.provider.send("evm_mine", []);
        await raffle.performUpkeep([]);
        const raffleState = await raffle.getRaffleState();
        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert.equal(raffleState.toString(), "1");
        assert.equal(upkeepNeeded, false);
      })
    })

    describe("performUpkeep", () => {
      it("can only run if checkupKeep is true", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
        await network.provider.send("evm_mine", []);
        const tx = await raffle.performUpkeep([]);
        assert(tx);
      })

      it("reverts when checkupkeep is false", async () => {
        await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(raffle, "Raffle__UpKeepNotNeeded");
      })

      it("updates the raffle state, emits and events", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
        await network.provider.send("evm_mine", []);
        const txResponse = await raffle.performUpkeep([]);
        const txReceipt = await txResponse.wait(1);
        const requestId = txReceipt.events[1].args.requestId;
        const raffleState = await raffle.getRaffleState();
        assert(requestId.toNumber() > 0);
        assert.equal(raffleState.toString(), 1)
      })
    })
    describe("fulfillRandomWords", function () {
      beforeEach(async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee })
        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
        await network.provider.request({ method: "evm_mine", params: [] })
      })
      it("can only be called after performupkeep", async () => {
        await expect(
          vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address) // reverts if not fulfilled
        ).to.be.revertedWith("nonexistent request");
        await expect(
          vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address) // reverts if not fulfilled
        ).to.be.revertedWith("nonexistent request");
      })

      // This test is too big...
      // This test simulates users entering the raffle and wraps the entire functionality of the raffle
      // inside a promise that will resolve if everything is successful.
      // An event listener for the WinnerPicked is set up
      // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
      // All the assertions are done once the WinnerPicked event is fired
      it("picks a winner, resets, and sends money", async () => {
        const additionalEntrances = 3; // to test
        const startingIndex = 2;
        for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) { // i = 2; i < 5; i=i+1
          raffle = raffle.connect(accounts[i]); // Returns a new instance of the Raffle contract connected to player
          await raffle.enterRaffle({ value: raffleEntranceFee });
        }
        const startingTimeStamp = await raffle.getLatestTimeStamp() // stores starting timestamp (before we fire our event)

        // This will be more important for our staging tests...
        await new Promise(async (resolve, reject) => {
          raffle.once("WinnerPicked", async () => { // event listener for WinnerPicked
            console.log("WinnerPicked event fired!")
            // assert throws an error if it fails, so we need to wrap
            // it in a try/catch so that the promise returns event
            // if it fails.
            try {
              // Now lets get the ending values...
              const recentWinner = await raffle.getRecentWinner();
              const raffleState = await raffle.getRaffleState();
              const winnerBalance = await accounts[2].getBalance();
              const endingTimeStamp = await raffle.getLatestTimeStamp();
              await expect(raffle.getPlayer(0)).to.be.reverted;
              // Comparisons to check if our ending values are correct:
              assert.equal(recentWinner.toString(), accounts[2].address);
              assert.equal(raffleState, 0);
              assert.equal(
                winnerBalance.toString(),
                startingBalance // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                  .add(
                    raffleEntranceFee
                      .mul(additionalEntrances)
                      .add(raffleEntranceFee)
                  )
                  .toString()
              )
              assert(endingTimeStamp > startingTimeStamp)
              resolve(); // if try passes, resolves the promise 
            } catch (e) {
              reject(e); // if try fails, rejects the promise
            }
          })

          // kicking off the event by mocking the chainlink keepers and vrf coordinator
          const tx = await raffle.performUpkeep("0x");
          const txReceipt = await tx.wait(1);
          const startingBalance = await accounts[2].getBalance();
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            txReceipt.events[1].args.requestId,
            raffle.address
          )
        })
      })
    })
  })
