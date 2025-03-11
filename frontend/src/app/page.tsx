'use client'
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { createBet, getBets } from "../lib/blockchain/services/betFactoryService";
import { placeBet, getMatchDetails, settleBet } from "../lib/blockchain/services/betContractService";
import { getSigner, getAccount, getBalance } from "../lib/blockchain/wallet";
import { getProvider } from "../lib/blockchain/provider";
import { useForm, SubmitHandler } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CreateBetFormData = {
  team1: string;
  team2: string;
  matchDate: string;
};

type PlaceBetFormData = {
  choice: string;
  amount: string;
};

type SettleMatchFormData = {
  result: string;
};

type BetDetails = {
  team1: string;
  team2: string;
  matchDate: number;
  isSettled: boolean;
  result: string;
  owner: string;
};

const BetPage = () => {
  const [bets, setBets] = useState<string[]>([]);
  const [betDetails, setBetDetails] = useState<{ [key: string]: BetDetails }>({});
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const {
    register: registerCreateBet,
    handleSubmit: handleSubmitCreateBet,
    reset: resetCreateBet,
    formState: { errors: errorsCreateBet },
  } = useForm<CreateBetFormData>();

  const {
    register: registerPlaceBet,
    handleSubmit: handleSubmitPlaceBet,
    reset: resetPlaceBet,
    formState: { errors: errorsPlaceBet },
  } = useForm<PlaceBetFormData>();

  const {
    register: registerSettleMatch,
    handleSubmit: handleSubmitSettleMatch,
    reset: resetSettleMatch,
    formState: { errors: errorsSettleMatch },
  } = useForm<SettleMatchFormData>();

  const onCreateBet: SubmitHandler<CreateBetFormData> = async (data) => {
    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const txHash = await createBet(
        signer,
        10, // platformFeePercent
        data.team1,
        data.team2,
        Math.floor(new Date(data.matchDate).getTime() / 1000)
      );
      console.log("Bet criado com sucesso! TX Hash:", txHash);
      resetCreateBet();
      await loadBets();
    } catch (error) {
      console.error("Erro ao criar bet:", error);
    }
  };

  const onPlaceBet: SubmitHandler<PlaceBetFormData> = async (data) => {
    if (!selectedBet) return;

    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const txHash = await placeBet(signer, selectedBet, data.choice, data.amount);
      console.log("Aposta realizada com sucesso! TX Hash:", txHash);
      resetPlaceBet();
      setSelectedBet(null);
    } catch (error) {
      console.error("Erro ao apostar:", error);
    }
  };

  const onSettleMatch: SubmitHandler<SettleMatchFormData> = async (data) => {
    if (!selectedBet) return;

    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const txHash = await settleBet(signer, selectedBet, data.result);
      console.log("Resultado inserido com sucesso! TX Hash:", txHash);
      resetSettleMatch();
      await loadBets();
    } catch (error) {
      console.error("Erro ao inserir resultado:", error);
    }
  };

  const loadBets = async () => {
    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const bets = await getBets(signer);
      setBets(bets);

      const details: { [key: string]: BetDetails } = {};
      for (const betAddress of bets) {
        const matchDetails = await getMatchDetails(signer, betAddress);
        details[betAddress] = matchDetails;
      }
      setBetDetails(details);
    } catch (error) {
      console.error("Erro ao carregar bets:", error);
    }
  };

  const loadAccountInfo = async () => {
    const account = await getAccount();
    const balance = await getBalance(account);
    setAccount(account);
    setBalance(ethers.utils.formatEther(balance));
  };

  useEffect(() => {
    loadBets();
    loadAccountInfo();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold">Bet Factory</h1>
          <p className="text-gray-600">Conta: {account}</p>
          <p className="text-gray-600">Saldo: {balance} ETH</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Aposta</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white hover:bg-blue-600">Criar Nova Aposta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Aposta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitCreateBet(onCreateBet)}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team1">Time 1</Label>
                    <Input
                      id="team1"
                      {...registerCreateBet("team1", { required: "Campo obrigatório" })}
                    />
                    {errorsCreateBet.team1 && (
                      <p className="text-red-500">{errorsCreateBet.team1.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="team2">Time 2</Label>
                    <Input
                      id="team2"
                      {...registerCreateBet("team2", { required: "Campo obrigatório" })}
                    />
                    {errorsCreateBet.team2 && (
                      <p className="text-red-500">{errorsCreateBet.team2.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="matchDate">Data da Partida</Label>
                    <Input
                      id="matchDate"
                      type="datetime-local"
                      {...registerCreateBet("matchDate", { required: "Campo obrigatório" })}
                    />
                    {errorsCreateBet.matchDate && (
                      <p className="text-red-500">{errorsCreateBet.matchDate.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">Criar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Lista de Apostas</h2>
          <ul className="space-y-4">
            {bets.map((bet, index) => (
              <li key={index} className="border p-4 rounded-lg">
                <div>
                  <p><strong>Time 1:</strong> {betDetails[bet]?.team1}</p>
                  <p><strong>Time 2:</strong> {betDetails[bet]?.team2}</p>
                  <p><strong>Data da Partida:</strong> {new Date(betDetails[bet]?.matchDate * 1000).toLocaleString()}</p>
                  <p><strong>Status:</strong> {betDetails[bet]?.isSettled ? "Encerrado" : "Aberto"}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 text-white hover:bg-green-600 mt-2" onClick={() => setSelectedBet(bet)}>Apostar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fazer Aposta</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPlaceBet(onPlaceBet)}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="choice">Escolha</Label>
                          <Select
                            {...registerPlaceBet("choice", { required: "Campo obrigatório" })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={betDetails[bet]?.team1}>{betDetails[bet]?.team1}</SelectItem>
                              <SelectItem value={betDetails[bet]?.team2}>{betDetails[bet]?.team2}</SelectItem>
                              <SelectItem value="Draw">Empate</SelectItem>
                            </SelectContent>
                          </Select>
                          {errorsPlaceBet.choice && (
                            <p className="text-red-500">{errorsPlaceBet.choice.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="amount">Valor (ETH)</Label>
                          <Input
                            id="amount"
                            type="number"
                            {...registerPlaceBet("amount", { required: "Campo obrigatório" })}
                          />
                          {errorsPlaceBet.amount && (
                            <p className="text-red-500">{errorsPlaceBet.amount.message}</p>
                          )}
                        </div>
                        <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">Apostar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {betDetails[bet]?.owner === account && !betDetails[bet]?.isSettled && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-red-500 text-white hover:bg-red-600 mt-2" onClick={() => setSelectedBet(bet)}>Inserir Resultado</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inserir Resultado</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmitSettleMatch(onSettleMatch)}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="result">Resultado</Label>
                            <Select
                              {...registerSettleMatch("result", { required: "Campo obrigatório" })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={betDetails[bet]?.team1}>{betDetails[bet]?.team1}</SelectItem>
                                <SelectItem value={betDetails[bet]?.team2}>{betDetails[bet]?.team2}</SelectItem>
                                <SelectItem value="Draw">Empate</SelectItem>
                              </SelectContent>
                            </Select>
                            {errorsSettleMatch.result && (
                              <p className="text-red-500">{errorsSettleMatch.result.message}</p>
                            )}
                          </div>
                          <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">Inserir</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BetPage;