const { ethers } = require("hardhat");
const { except, assert } = require("chai");

describe("simpleStorage", () => {
  let simpleStorageFactory;
  let simpleStorage;

  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await  simpleStorageFactory.deploy();
  })

  it("start number is 0", async () => {
    const currentValue = await simpleStorage.retrieve();
    const exceptedNumber = "0";

    assert.equal(currentValue.toString(), exceptedNumber);
    // except(currentValue.toString()).to.equal(exceptedNumber);

  })

  it.only("end number is 7", async () => {
    const storeRes = await simpleStorage.store("7")
    await storeRes.wait(1);
    const changeNumber = await simpleStorage.retrieve();
    const exceptedNumber = "7";

    assert.equal(changeNumber.toString(), exceptedNumber);
  })
})