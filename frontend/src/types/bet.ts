type Bet = {
    choice: string;
    amount: string;
    status: BetStatus;
};

type BetStatus = "Pending" | "Won" | "Lost";
export type { Bet, BetStatus };
