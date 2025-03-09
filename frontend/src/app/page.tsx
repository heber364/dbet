'use client'
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { createBet, getBets } from "../lib/blockchain/services/betFactoryService";
import {
  placeBet,
  getMatchDetails,
} from "../lib/blockchain/services/betContractService";
import { getSigner } from "../lib/blockchain/wallet";
import { getProvider } from "../lib/blockchain/provider";

import { useForm, SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type BetDetails = {
  team1: string;
  team2: string;
  matchDate: number;
  isSettled: boolean;
};

const BetPage = () => {
  const [bets, setBets] = useState<string[]>([]); // Lista de endereços dos bets
  const [betDetails, setBetDetails] = useState<{ [key: string]: BetDetails }>({}); // Detalhes de cada bet
  const [selectedBet, setSelectedBet] = useState<string | null>(null); // Bet selecionado

  const {
    register: registerCreateBet,
    handleSubmit: handleSubmitCreateBet,
    reset: resetCreateBet,
    formState: { errors: errorsCreateBet },
  } = useForm<CreateBetFormData>();

  const onCreateBet: SubmitHandler<CreateBetFormData> = async (data) => {
    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const txHash = await createBet(
        signer,
        10, // platformFeePercent
        data.team1,
        data.team2,
        Math.floor(new Date(data.matchDate).getTime() / 1000) // Converte a data para timestamp
      );
      console.log("Bet criado com sucesso! TX Hash:", txHash);
      resetCreateBet(); // Limpa o formulário
      await loadBets(); // Recarrega a lista de bets
    } catch (error) {
      console.error("Erro ao criar bet:", error);
    }
  };

  const {
    register: registerPlaceBet,
    handleSubmit: handleSubmitPlaceBet,
    reset: resetPlaceBet,
    formState: { errors: errorsPlaceBet },
  } = useForm<PlaceBetFormData>();

  const onPlaceBet: SubmitHandler<PlaceBetFormData> = async (data) => {
    if (!selectedBet) return;

    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const txHash = await placeBet(signer, selectedBet, data.choice, data.amount);
      console.log("Aposta realizada com sucesso! TX Hash:", txHash);
      resetPlaceBet(); // Limpa o formulário
      setSelectedBet(null); // Reseta o bet selecionado
    } catch (error) {
      console.error("Erro ao apostar:", error);
    }
  };

  const loadBets = async () => {
    try {
      const provider = getProvider();
      const signer = await getSigner(provider);
      const bets = await getBets(signer);
      setBets(bets);

      // Carrega os detalhes de cada bet
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

  useEffect(() => {
    loadBets();
  }, []);

  return (
    <div>
      <h1>Bet Factory</h1>

      {/* Modal de criação de bet */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Criar Nova Aposta</Button>
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
              <Button type="submit">Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de bets */}
      <h2>Lista de Apostas</h2>
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
                <Button onClick={() => setSelectedBet(bet)}>Apostar</Button>
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
                          <SelectItem value="Team A">Team A</SelectItem>
                          <SelectItem value="Team B">Team B</SelectItem>
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
                    <Button type="submit">Apostar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BetPage;