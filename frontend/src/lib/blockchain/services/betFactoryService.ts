import { ethers } from "ethers";
import BetFactory from "../contracts/BetFactory.json";

const betFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function createBet(
  signer: ethers.providers.JsonRpcSigner,
  platformFeePercent: number,
  team1: string,
  team2: string,
  matchDate: number,
  owner: string
): Promise<string> {
  const contract = new ethers.Contract(
    betFactoryAddress,
    BetFactory.abi,
    signer
  );
  const tx = await contract.createBet(
    platformFeePercent,
    team1,
    team2,
    matchDate,
    owner
  );
  await tx.wait();
  return tx.hash;
}

async function getBets(
  signer: ethers.providers.JsonRpcSigner
): Promise<string[]> {
  const contract = new ethers.Contract(
    betFactoryAddress,
    BetFactory.abi,
    signer
  );
  return await contract.getBets();
}

export { createBet, getBets };
