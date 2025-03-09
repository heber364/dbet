import { ethers } from "ethers";

const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error("Metamask não encontrado!");
};

export { getProvider };
