import { ethers } from "ethers";
import BetContract from "../contracts/BetContract.json";

import { Bet } from "@/types/bet"
import { BetDetails, BetAmount } from "@/types/betDetails"

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
): Promise<BetAmount> {
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

async function getMatchDetails(signer: ethers.providers.JsonRpcSigner, betContractAddress: string): Promise<BetDetails> {
  const contract = new ethers.Contract(betContractAddress, BetContract.abi, signer);
  const match = await contract.currentMatch();
  const amounts = await getTotalBetsByChoice(signer, betContractAddress);
  return {
    team1: match.team1,
    team2: match.team2,
    matchDate: match.matchDate.toNumber(),
    isSettled: match.isSettled,
    result: match.result, 
    owner: match.owner,
    amounts: amounts,
    ownerAmount: ethers.utils.formatEther(match.ownerAmount),
  };
}



async function getMyBets(
  signer: ethers.providers.JsonRpcSigner,
  betContractAddress: string
): Promise<Bet> {
  const contract = new ethers.Contract(
    betContractAddress,
    BetContract.abi,
    signer
  );
  

  const bet = await contract.getMyBets();
  
  return {
    choice: bet.choice,
    amount: ethers.utils.formatEther(bet.amount),
    status: bet.status,
    amountWon: ethers.utils.formatEther(bet.amountWon),

  };
}

export {
  placeBet,
  settleBet,
  getTotalBetsByChoice,
  isMatchSettled,
  getTotalBets,
  getMatchDetails,
  getMyBets
};
