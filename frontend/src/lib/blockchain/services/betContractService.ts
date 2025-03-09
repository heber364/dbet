import { ethers } from "ethers";
import BetContract from "../contracts/BetContract.json";

async function placeBet(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string,
  choice: string,
  amount: string
): Promise<string> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  const tx = await contract.placeBet(choice, {
    value: ethers.utils.parseEther(amount),
  });
  await tx.wait();
  return tx.hash;
}

async function settleBet(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string,
  result: string
): Promise<string> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  const tx = await contract.settleBet(result);
  await tx.wait();
  return tx.hash;
}

async function getTotalBetsByChoice(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string
): Promise<{
  totalTeam1: string;
  totalTeam2: string;
  totalDraw: string;
}> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  const [totalTeam1, totalTeam2, totalDraw] =
    await contract.getTotalBetsByChoice();
  return {
    totalTeam1: ethers.utils.formatEther(totalTeam1),
    totalTeam2: ethers.utils.formatEther(totalTeam2),
    totalDraw: ethers.utils.formatEther(totalDraw),
  };
}

async function isMatchSettled(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string
): Promise<boolean> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  return await contract.isMatchSettled();
}

async function getTotalBets(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string
): Promise<string> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  const totalBets = await contract.getTotalBets();
  return ethers.utils.formatEther(totalBets);
}

export {
  placeBet,
  settleBet,
  getTotalBetsByChoice,
  isMatchSettled,
  getTotalBets,
};
