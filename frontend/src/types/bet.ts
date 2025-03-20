type Bet = {
    choice: string;
    amount: string;
    status: BetStatus;
    amountWon: string;
};

type BetStatus = "Pending" | "Won" | "Lost";
export type { Bet, BetStatus };
