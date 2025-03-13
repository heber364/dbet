import { ethers } from "ethers";
import { getProvider } from "./provider";

const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== "undefined";
};

export const getSigner = async (provider: ethers.providers.Web3Provider) => {
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getAccount = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask não está instalado.");
  }
  const provider = getProvider();
  const signer = await getSigner(provider);
  return await signer.getAddress();
};

export const getBalance = async (account: string) => {
  const provider = getProvider();
  return await provider.getBalance(account);
};

export const getNetwork = async () => {
  const provider = getProvider();
  return await provider.getNetwork();
};
