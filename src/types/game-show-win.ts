export interface GameShowWin {
    id: string;
    gameShowEventId: string;
    gameShow: string;
    multiplier: number;
    startedAt: string;
    settledAt: string;
    durationInSeconds: number;
    spinOutcome: string;
    position?: number;
    type?: string;
    streamUrl: string;
    thumbnailUrl: string;
    totalWinners?: number;
    totalAmount?: number;
    bettorsCount?: number;
    winners?: Array<GameShowWinner>;
}

export interface GameShowWinner {
    screenName: string;
    winnings: number;
}
