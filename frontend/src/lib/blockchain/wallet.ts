import { ethers } from "ethers";

const getSigner = async (provider: ethers.providers.Web3Provider) => {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner();
  return signer;
}; 

export { getSigner };
