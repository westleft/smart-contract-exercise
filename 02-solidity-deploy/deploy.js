const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  const encryptKeyJson = fs.readFileSync("./.encryptKey.json", "utf8");

  let wallet = ethers.Wallet.fromEncryptedJsonSync(
    encryptKeyJson,
    process.env.PRIVATE_KEY_PASSWORD
  )

  wallet = wallet.connect(provider);

  const abi = fs.readFileSync("SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync("SimpleStorage_sol_SimpleStorage.bin", "utf8");

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("waiting...")

  const contract = await contractFactory.deploy();
  console.log("address: ", contract.address);
  // console.log(contract)

  const deploymentReceipt = await contract.deployTransaction.wait(1);
  // console.log(deploymentReceipt)

  const favoriteNumber = await contract.retrieve();
  console.log(favoriteNumber.toString())

  const res = await contract.store("7");
  const waitNum = await res.wait(1);

  // console.log("waitNum", waitNum)

  const favoriteNumber2 = await contract.retrieve();
  console.log(favoriteNumber2.toString())
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
