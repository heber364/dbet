type BetDetails = {
    team1: string;
    team2: string;
    matchDate: number;
    isSettled: boolean;
    result: string;
    owner: string;
    ownerAmount: string;
    amounts: BetAmount;
};

type BetAmount = {
  totalTeam1: string;
  totalTeam2: string;
  totalDraw: string;
};

export type { BetDetails, BetAmount };