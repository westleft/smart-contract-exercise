import { ethers } from "./node_modules/ethers/dist/ethers.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.querySelector("#connect-btn");
connectButton.addEventListener("click", async () => {
  if (!window.ethereum) return;
  window.ethereum.request({ method: "eth_requestAccounts" });
});

// ------ fund ------
const fundButton = document.querySelector("#fund-btn");
fundButton.addEventListener("click", async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  // 取得地址
  const signer = await provider.getSigner();
  console.log(signer);
  console.log(abi);

  const contract = new ethers.Contract(contractAddress, abi, signer);
  console.log(contract);
  try {
    const transactionResponse = await contract.fund({
      value: ethers.parseEther("1")
    });

    // const result = await listenTransactionMine(transactionResponse, provider);
    const transactionReceipt = await transactionResponse.wait(1);
    console.log(transactionReceipt)

    // console.log(transactionResponse)

  } catch(e) {
    console.log(e)
  }
});

function listenTransactionMine(transaction, provider) {
  console.log(transaction.hash)

  return provider.once(transaction.hash, async (receipt) => {
    return receipt.confirmations()
    // console.log("complete with", await receipt.confirmations())
  })
}

// ------ balance ------
const getBalanceButton = document.querySelector("#get-balance-btn");
getBalanceButton.addEventListener("click", async () => {
  if (!window.ethereum) return;
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const balance = await provider.getBalance(contractAddress);
  console.log(ethers.formatEther(balance))
})

// ------ withdraw ------
const withdrawButton = document.querySelector("#withdraw-btn");
withdrawButton.addEventListener("click", async () => {
  if (!window.ethereum) return;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  try {
    const transactionResponse = await contract.withdraw();
    const transactionReceipt = await transactionResponse.wait(1);
    console.log(transactionReceipt)
  } catch(e) {
    console.log(e);
  }
})

