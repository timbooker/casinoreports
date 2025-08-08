export interface GameResult {
    id: string;
    data: GameData;
    totalWinners: number;
    totalAmount: number;
    winners: Winner[];
}

export interface GameData {
    id: string;
    startedAt: string;
    settledAt: string;
    status: string;
    gameType: string;
    table: Table;
    result: GameResultData;
}

export interface Table {
    id: string;
    name: string;
}

export interface GameResultData {
    luckyNumbers: Record<string, number[]>;
    luckyNumbersList: LuckyNumber[];
    first: number;
    second: number;
    third: number;
    value: string;
    total: number;
}

export interface LuckyNumber {
    outcome: string;
    multiplier: number;
}

export interface Winner {
    screenName: string;
    winnings: number;
}

export interface WheelResult {
    type: string;
    wheelSector: string;
    isSugarbomb: boolean;
}

export interface Outcome {
    wheelResult: WheelResult;
    maxMultiplier: number;
}
