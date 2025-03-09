import { ethers } from 'ethers';
import BetContract from '../contracts/BetContract.json';
import { getSigner } from '../wallet';
import { getProvider } from '../provider';

async function placeBet(betContractAddress: string, choice: string, amount: string): Promise<string> {
    const signer = await getSigner();
    const betContract = new ethers.Contract(betContractAddress, BetContract.abi, signer);
    const tx = await betContract.placeBet(choice, { value: ethers.utils.parseEther(amount) });
    await tx.wait();
    return tx.hash;
}

async function settleBet(betContractAddress: string, result: string): Promise<string> {
    const signer = await getSigner();
    const betContract = new ethers.Contract(betContractAddress, BetContract.abi, signer);
    const tx = await betContract.settleBet(result);
    await tx.wait();
    return tx.hash;
}

async function getTotalBetsByChoice(betContractAddress: string): Promise<{
    totalTeam1: string;
    totalTeam2: string;
    totalDraw: string;
}> {
    const provider = getProvider();
    const betContract = new ethers.Contract(betContractAddress, BetContract.abi, provider);
    const [totalTeam1, totalTeam2, totalDraw] = await betContract.getTotalBetsByChoice();
    return {
        totalTeam1: ethers.utils.formatEther(totalTeam1),
        totalTeam2: ethers.utils.formatEther(totalTeam2),
        totalDraw: ethers.utils.formatEther(totalDraw),
    };
}

async function isMatchSettled(betContractAddress: string): Promise<boolean> {
    const provider = getProvider();
    const betContract = new ethers.Contract(betContractAddress, BetContract.abi, provider);
    return await betContract.isMatchSettled();
}

async function getTotalBets(betContractAddress: string): Promise<string> {
    const provider = getProvider();
    const betContract = new ethers.Contract(betContractAddress, BetContract.abi, provider);
    const totalBets = await betContract.getTotalBets();
    return ethers.utils.formatEther(totalBets);
}

export { placeBet, settleBet, getTotalBetsByChoice, isMatchSettled, getTotalBets };