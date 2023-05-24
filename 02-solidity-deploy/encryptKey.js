const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

const main = async () => {
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  // const encryptJsonKey = await wallet.encrypt(
  //   process.env.PRIVATE_PASSWORD,
  //   process.env.PRIVATE_KEY
  // );
  const encryptJsonKey = await wallet.encrypt(
    "12345",
    process.env.PRIVATE_KEY
  );
  

  fs.writeFileSync("./.encryptKey.json", encryptJsonKey);

  console.log(encryptJsonKey)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
