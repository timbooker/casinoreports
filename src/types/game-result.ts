export interface GameResult {
    id: string;
    data: GameData;
}

export interface GameData {
    id: string;
    startedAt: string;
    settledAt: string;
    status: string;
    gameType: string;
    table: Table;
    result: Record<string, any>;
}

export interface Table {
    id: string;
    name: string;
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
