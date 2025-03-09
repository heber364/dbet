import { ethers } from 'ethers';
import BetFactory from '../contracts/BetFactory.json';
import { getSigner } from '../wallet';

const betFactoryAddress = process.env.NEXT_PUBLIC_BET_FACTORY_CONTRACT_ADDRESS;

if (!betFactoryAddress) {
    throw new Error('BetFactory contract address is not defined');
}

const signer = await getSigner();

const betFactoryContract = new ethers.Contract(
    betFactoryAddress,
    BetFactory.abi,
    signer
);

export async function createBet(platformFeePercent: number, team1: string, team2: string, matchDate: number): Promise<string> {
    const tx = await betFactoryContract.createBet(platformFeePercent, team1, team2, matchDate);
    await tx.wait();
    return tx.hash;
}

export async function getBets(): Promise<string[]> {
    return await betFactoryContract.getBets();
}