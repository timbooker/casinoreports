// No Prisma dependency - functions accept data as parameters

export interface OutcomeData {
    outcome?: {
        topSlot?: {
            multiplier?: number;
            wheelSector?: string;
        };
        wheelResult?: {
            type?: string;
            wheelSector?: string;
        };
        maxMultiplier?: number;
        isTopSlotMatchedToWheelResult?: boolean;
        cashHunt?: {
            positions?: Array<Array<{ symbol?: string; multiplier?: number }>>;
        };
        crazyBonus?: {
            flapper?: {
                symbol?: string;
                multiplier?: number;
            };
        };
        coinFlip?: {
            symbol?: string;
            multiplier?: number;
        };
    };
    [key: string]: any;
}

export function getWheelResultString(outcome: OutcomeData["outcome"]): string | null {
    if (!outcome?.wheelResult) return null;
    
    const wheelResult = outcome.wheelResult;
    // If it's a WinningNumber type, use wheelSector, otherwise use type
    if (wheelResult.type === "WinningNumber" && wheelResult.wheelSector) {
        return wheelResult.wheelSector;
    }
    return wheelResult.type || wheelResult.wheelSector || null;
}

/**
 * Truncates a screen name to show first 3 characters + "..."
 */
export function truncateScreenName(screenName: string | null | undefined): string {
    if (!screenName) return "";
    return screenName.length > 5 ? screenName.substring(0, 3) + "..." : screenName;
}

/**
 * Gets the spin outcome string from an outcome
 */
export function getSpinOutcome(outcome: OutcomeData["outcome"]): string {
    if (!outcome?.wheelResult) return "Unknown";
    
    const wheelResult = outcome.wheelResult;
    // For spinOutcome: if BonusRound, use wheelSector (e.g., "Pachinko", "CashHunt"), otherwise use getWheelResultString
    if (wheelResult.type === "BonusRound" && wheelResult.wheelSector) {
        return wheelResult.wheelSector;
    }
    return getWheelResultString(outcome) || "Unknown";
}

/**
 * Gets the roulette color for a winning number
 */
export function getRouletteColor(number: number): string {
    if (number === 0) return "Green";
    // European roulette pattern
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? "Red" : "Black";
}

/**
 * Transforms a game result to biggest win format
 */
export function transformToBiggestWin(
    result: {
        id: string;
        external_id: string;
        started_at: Date;
        settled_at: Date;
        result: any;
        winners?: any;
        total_winners?: number | null;
        total_amount?: number | null;
    },
    gameApiName: string
): any | null {
    const resultData = result.result as any;
    const outcome = resultData?.outcome;
    if (!outcome || typeof outcome !== 'object') return null;

    const maxMultiplier = outcome.maxMultiplier || 0;
    if (maxMultiplier < 50) return null; // Require at least 50x for big wins

    const wheelResult = outcome.wheelResult;
    const spinOutcome = getSpinOutcome(outcome);

    const startedAt = result.started_at;
    const settledAt = result.settled_at;
    const durationInSeconds = Math.floor((settledAt.getTime() - startedAt.getTime()) / 1000);

    const gameShow = gameApiName.toUpperCase().replace(/-/g, "_");

    // Transform winners
    let winners: any[] | undefined = undefined;
    if (result.winners && Array.isArray(result.winners)) {
        winners = (result.winners as any[]).map((w: any) => ({
            screenName: truncateScreenName(w.screenName),
            winnings: w.winnings || 0
        }));
    }

    const win: any = {
        id: result.external_id,
        gameShowEventId: result.external_id,
        gameShow: gameShow,
        multiplier: maxMultiplier,
        startedAt: startedAt.toISOString(),
        settledAt: settledAt.toISOString(),
        durationInSeconds,
        spinOutcome: String(spinOutcome),
        streamUrl: `https://media.groundsplatform.com/streamer/clips/${result.external_id}/index.m3u8`,
        thumbnailUrl: `https://media.groundsplatform.com/streamer/thumbs/${result.external_id}.jpg`
    };

    // Add optional fields
    if (result.total_winners !== null && result.total_winners !== undefined) {
        win.totalWinners = result.total_winners;
    }

    if (result.total_amount !== null && result.total_amount !== undefined) {
        win.totalAmount = result.total_amount;
    }

    if (winners && winners.length > 0) {
        win.winners = winners;
    }

    // Handle roulette number color for roulette games
    if (gameShow.includes("ROULETTE") && wheelResult?.type === "WinningNumber" && wheelResult.wheelSector) {
        const number = parseInt(wheelResult.wheelSector);
        if (!isNaN(number)) {
            win.rouletteNumberColor = getRouletteColor(number);
        }
    }

    return win;
}

/**
 * Processes game results and returns the biggest wins, sorted by multiplier
 * @param results Array of game results from the database
 * @param gameMap Map of game ID to game api_name
 * @param size Maximum number of wins to return
 */
export function getBiggestWins(
    results: Array<{
        id: string;
        external_id: string;
        started_at: Date;
        settled_at: Date;
        result: any;
        winners?: any;
        total_winners?: number | null;
        total_amount?: number | null;
        casino_game_id: string;
    }>,
    gameMap: Map<string, string>,
    size: number
): any[] {
    const wins: any[] = [];

    for (const result of results) {
        const gameApiName = gameMap.get(result.casino_game_id);
        if (!gameApiName) continue;

        const win = transformToBiggestWin(result, gameApiName);
        if (win) {
            wins.push(win);
        }
    }

    // Sort by multiplier descending, then by settledAt descending
    wins.sort((a, b) => {
        if (b.multiplier !== a.multiplier) {
            return b.multiplier - a.multiplier;
        }
        return new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime();
    });

    return wins.slice(0, size);
}

/**
 * Transforms a database game result to the API response format
 */
export function transformGameResult(result: any) {
    const dataRaw = result.data_raw as any;
    
    // Build the data object with transformations
    const data = {
        ...dataRaw,
        id: result.external_id,
        startedAt: result.started_at.toISOString(),
        settledAt: result.settled_at.toISOString(),
        status: result.status,
        result: result.result
    };

    // Transform winners to truncate screen names
    let winners: any[] | undefined = undefined;
    if (result.winners && Array.isArray(result.winners)) {
        winners = (result.winners as any[]).map((winner: any) => ({
            screenName: truncateScreenName(winner.screenName),
            winnings: winner.winnings || 0
        }));
    }

    // Build the result object
    const transformed: any = {
        id: result.external_id,
        data
    };

    // Add transmissionId if it exists in data_raw
    if (dataRaw?.transmissionId) {
        transformed.transmissionId = dataRaw.transmissionId;
    }

    // Add optional fields if they exist
    if (result.total_winners !== null && result.total_winners !== undefined) {
        transformed.totalWinners = result.total_winners;
    }

    if (result.total_amount !== null && result.total_amount !== undefined) {
        transformed.totalAmount = result.total_amount;
    }

    if (winners && winners.length > 0) {
        transformed.winners = winners;
    }

    return transformed;
}

/**
 * Aggregates game statistics from a list of game results
 * @param results Array of game results from the database
 */
export function aggregateGameStats(results: Array<{
    id: string;
    external_id: string;
    settled_at: Date;
    started_at: Date;
    result: any;
    winners?: any;
    total_winners?: number | null;
    total_amount?: number | null;
}>) {
    const totalCount = results.length;
    if (totalCount === 0) {
        return {
            totalCount: 0,
            aggStats: [],
            bestMultipliers: [],
            topSlotToWheelResultStats: [],
            bestIndividualWins: [],
            cashHuntAvgStatsByPosition: null,
            cashHuntSymbolStats: [],
            crazyBonusFlapperStats: [],
            coinFlipStats: []
        };
    }

    // Aggregate wheel results
    const wheelResultMap = new Map<string, {
        count: number;
        lastOccurredAt: Date;
        occurrences: Date[];
    }>();

    const bestMultipliersMap = new Map<string, {
        id: string;
        external_id: string;
        wheelResult: string;
        lastOccurredAt: Date;
        maxMultiplier: number;
        bigWinStreamUrl?: string;
    }>();

    let topSlotMatchedCount = 0;
    let topSlotUnmatchedCount = 0;

    const cashHuntData: Array<{
        positions: Array<Array<{ symbol?: string; multiplier?: number }>>;
    }> = [];

    const cashHuntSymbolMap = new Map<string, { multipliers: number[] }>();

    const crazyBonusFlapperMap = new Map<string, { multipliers: number[] }>();

    const coinFlipMap = new Map<string, {
        count: number;
        multipliers: number[];
    }>();

    const individualWins: Array<{
        id: string;
        external_id: string;
        screenName: string;
        winAmount: number;
        wheelResult: string;
        maxMultiplier: number;
        lastOccurredAt: Date;
    }> = [];

    // Process each result
    for (const result of results) {
        const resultData = result.result as any;
        const outcome = resultData?.outcome;
        if (!outcome || typeof outcome !== 'object') continue;

        const wheelResult = getWheelResultString(outcome);
        if (wheelResult) {
            // Update wheel result stats
            if (!wheelResultMap.has(wheelResult)) {
                wheelResultMap.set(wheelResult, {
                    count: 0,
                    lastOccurredAt: result.settled_at,
                    occurrences: []
                });
            }
            const stats = wheelResultMap.get(wheelResult)!;
            stats.count++;
            stats.occurrences.push(result.settled_at);
            if (result.settled_at > stats.lastOccurredAt) {
                stats.lastOccurredAt = result.settled_at;
            }

            // Track best multipliers
            const maxMultiplier = outcome.maxMultiplier || 0;
            const existing = bestMultipliersMap.get(wheelResult);
            if (!existing || maxMultiplier > existing.maxMultiplier) {
                bestMultipliersMap.set(wheelResult, {
                    id: result.id,
                    external_id: result.external_id,
                    wheelResult,
                    lastOccurredAt: result.settled_at,
                    maxMultiplier,
                    bigWinStreamUrl: result.external_id ? 
                        `https://media.groundsplatform.com/streamer/clips/${result.external_id}/index.m3u8` : undefined
                });
            }
        }

        // Top slot matching stats
        if (outcome.isTopSlotMatchedToWheelResult !== undefined) {
            if (outcome.isTopSlotMatchedToWheelResult) {
                topSlotMatchedCount++;
            } else {
                topSlotUnmatchedCount++;
            }
        }

        // Cash Hunt stats
        if (outcome.cashHunt?.positions) {
            cashHuntData.push({ positions: outcome.cashHunt.positions });
            
            // Aggregate by symbol
            for (const row of outcome.cashHunt.positions) {
                for (const cell of row) {
                    if (cell.symbol && cell.multiplier !== undefined) {
                        if (!cashHuntSymbolMap.has(cell.symbol)) {
                            cashHuntSymbolMap.set(cell.symbol, { multipliers: [] });
                        }
                        cashHuntSymbolMap.get(cell.symbol)!.multipliers.push(cell.multiplier);
                    }
                }
            }
        }

        // Crazy Bonus flapper stats
        if (outcome.crazyBonus?.flapper) {
            const symbol = outcome.crazyBonus.flapper.symbol || "Unknown";
            const multiplier = outcome.crazyBonus.flapper.multiplier || 0;
            if (!crazyBonusFlapperMap.has(symbol)) {
                crazyBonusFlapperMap.set(symbol, { multipliers: [] });
            }
            crazyBonusFlapperMap.get(symbol)!.multipliers.push(multiplier);
        }

        // Coin Flip stats
        if (outcome.coinFlip) {
            const symbol = outcome.coinFlip.symbol || "Unknown";
            const multiplier = outcome.coinFlip.multiplier || 0;
            if (!coinFlipMap.has(symbol)) {
                coinFlipMap.set(symbol, { count: 0, multipliers: [] });
            }
            const stats = coinFlipMap.get(symbol)!;
            stats.count++;
            stats.multipliers.push(multiplier);
        }

        // Individual wins
        if (result.winners && Array.isArray(result.winners)) {
            for (const winner of result.winners) {
                if (winner.screenName && winner.winnings && wheelResult) {
                    individualWins.push({
                        id: result.id,
                        external_id: result.external_id,
                        screenName: winner.screenName,
                        winAmount: winner.winnings,
                        wheelResult,
                        maxMultiplier: outcome.maxMultiplier || 0,
                        lastOccurredAt: result.settled_at
                    });
                }
            }
        }
    }

    // Calculate last seen before (how many results ago)
    const calculateLastSeenBefore = (lastOccurredAt: Date, allResults: typeof results): number => {
        const sortedResults = [...allResults].sort((a, b) => 
            b.settled_at.getTime() - a.settled_at.getTime()
        );
        for (let i = 0; i < sortedResults.length; i++) {
            if (sortedResults[i].settled_at.getTime() === lastOccurredAt.getTime()) {
                return i;
            }
        }
        return sortedResults.length;
    };

    // Calculate hot frequency percentage (simplified - would need historical data for accurate calculation)
    const calculateHotFrequencyPercentage = (count: number, total: number, longTermAverage: number): number => {
        const currentPercentage = (count / total) * 100;
        return currentPercentage - longTermAverage;
    };

    // Build aggStats
    const aggStats = Array.from(wheelResultMap.entries()).map(([wheelResult, stats]) => {
        const percentage = (stats.count / totalCount) * 100;
        const lastSeenBefore = calculateLastSeenBefore(stats.lastOccurredAt, results);
        // For now, use current percentage as long-term average (would need historical data for real calculation)
        const longTermAverage = percentage;
        const hotFrequencyPercentage = calculateHotFrequencyPercentage(stats.count, totalCount, longTermAverage);

        return {
            wheelResult,
            count: stats.count,
            percentage: Number(percentage.toFixed(2)),
            lastOccurredAt: stats.lastOccurredAt.toISOString(),
            lastSeenBefore,
            hotFrequencyPercentage: Number(hotFrequencyPercentage.toFixed(2))
        };
    }).sort((a, b) => b.count - a.count);

    // Build bestMultipliers (top 5)
    const bestMultipliers = Array.from(bestMultipliersMap.values())
        .sort((a, b) => b.maxMultiplier - a.maxMultiplier)
        .slice(0, 5)
        .map(item => ({
            id: item.external_id,
            wheelResult: item.wheelResult,
            lastOccurredAt: item.lastOccurredAt.toISOString(),
            maxMultiplier: item.maxMultiplier,
            bigWinStreamUrl: item.bigWinStreamUrl
        }));

    // Build topSlotToWheelResultStats
    const topSlotTotal = topSlotMatchedCount + topSlotUnmatchedCount;
    const topSlotToWheelResultStats = [
        {
            matched: false,
            percentage: topSlotTotal > 0 ? Number(((topSlotUnmatchedCount / topSlotTotal) * 100).toFixed(2)) : 0,
            totalCount: topSlotUnmatchedCount,
            topSlotMatchedFrequencyPercentage: 0, // Would need historical data
            topSlotMatchedLongTermAverage: topSlotTotal > 0 ? Number(((topSlotUnmatchedCount / topSlotTotal) * 100).toFixed(2)) : 0
        },
        {
            matched: true,
            percentage: topSlotTotal > 0 ? Number(((topSlotMatchedCount / topSlotTotal) * 100).toFixed(2)) : 0,
            totalCount: topSlotMatchedCount,
            topSlotMatchedFrequencyPercentage: 0, // Would need historical data
            topSlotMatchedLongTermAverage: topSlotTotal > 0 ? Number(((topSlotMatchedCount / topSlotTotal) * 100).toFixed(2)) : 0
        }
    ];

    // Build bestIndividualWins (top 5)
    const bestIndividualWins = individualWins
        .sort((a, b) => b.winAmount - a.winAmount)
        .slice(0, 5)
        .map(win => ({
            id: win.external_id,
            screenName: truncateScreenName(win.screenName),
            winAmount: win.winAmount,
            wheelResult: win.wheelResult,
            maxMultiplier: win.maxMultiplier,
            lastOccurredAt: win.lastOccurredAt.toISOString()
        }));

    // Build cashHuntAvgStatsByPosition
    let cashHuntAvgStatsByPosition: any = null;
    if (cashHuntData.length > 0) {
        // Assume 12x9 grid (adjust based on actual data)
        const gridSize = { rows: 12, cols: 9 };
        const avgArray: number[][] = [];
        const positionCounts: number[][] = [];
        const positionSums: number[][] = [];

        // Initialize arrays
        for (let i = 0; i < gridSize.rows; i++) {
            avgArray[i] = [];
            positionCounts[i] = [];
            positionSums[i] = [];
            for (let j = 0; j < gridSize.cols; j++) {
                avgArray[i][j] = 0;
                positionCounts[i][j] = 0;
                positionSums[i][j] = 0;
            }
        }

        // Aggregate multipliers by position
        for (const cashHunt of cashHuntData) {
            for (let i = 0; i < cashHunt.positions.length && i < gridSize.rows; i++) {
                for (let j = 0; j < cashHunt.positions[i].length && j < gridSize.cols; j++) {
                    const cell = cashHunt.positions[i][j];
                    if (cell.multiplier !== undefined) {
                        positionCounts[i][j]++;
                        positionSums[i][j] += cell.multiplier;
                    }
                }
            }
        }

        // Calculate averages
        let maxMultiplier = 0;
        let minMultiplier = Infinity;
        for (let i = 0; i < gridSize.rows; i++) {
            for (let j = 0; j < gridSize.cols; j++) {
                if (positionCounts[i][j] > 0) {
                    avgArray[i][j] = (positionSums[i][j] / positionCounts[i][j]);
                    maxMultiplier = Math.max(maxMultiplier, avgArray[i][j]);
                    minMultiplier = Math.min(minMultiplier, avgArray[i][j]);
                }
            }
        }

        cashHuntAvgStatsByPosition = {
            cashHuntAvgArray: avgArray,
            maxMultiplier: maxMultiplier === Infinity ? 0 : Number(maxMultiplier.toFixed(2)),
            minMultiplier: minMultiplier === Infinity ? 0 : Number(minMultiplier.toFixed(2))
        };
    }

    // Build cashHuntSymbolStats
    const cashHuntSymbolStats = Array.from(cashHuntSymbolMap.entries()).map(([symbol, data]) => {
        const avgMultiplier = data.multipliers.length > 0
            ? data.multipliers.reduce((a, b) => a + b, 0) / data.multipliers.length
            : 0;
        const count = data.multipliers.length;
        // Simplified long-term average (would need historical data)
        const longTermAverage = avgMultiplier;
        const frequencyPercentage = avgMultiplier - longTermAverage;

        return {
            symbol,
            avgMultiplier: Number(avgMultiplier.toFixed(2)),
            count,
            cashHuntMultiplierFrequencyPercentage: Number(frequencyPercentage.toFixed(2)),
            cashHuntLongTermAverage: Number(longTermAverage.toFixed(2))
        };
    }).sort((a, b) => b.avgMultiplier - a.avgMultiplier);

    // Build crazyBonusFlapperStats
    const crazyBonusFlapperStats = Array.from(crazyBonusFlapperMap.entries()).map(([symbol, data]) => {
        const avgMultiplier = data.multipliers.length > 0
            ? data.multipliers.reduce((a, b) => a + b, 0) / data.multipliers.length
            : 0;
        // Simplified long-term average
        const longTermAverage = avgMultiplier;
        const frequencyPercentage = ((avgMultiplier - longTermAverage) / longTermAverage) * 100;

        return {
            symbol,
            avgMultiplier: Number(avgMultiplier.toFixed(2)),
            flapperLongTermAverageMultiplier: Number(longTermAverage.toFixed(2)),
            flapperMultiplierFrequencyPercentage: Number(frequencyPercentage.toFixed(2))
        };
    });

    // Build coinFlipStats
    const coinFlipTotal = Array.from(coinFlipMap.values()).reduce((sum, stats) => sum + stats.count, 0);
    const coinFlipStats = Array.from(coinFlipMap.entries()).map(([symbol, data]) => {
        const avgMultiplier = data.multipliers.length > 0
            ? data.multipliers.reduce((a, b) => a + b, 0) / data.multipliers.length
            : 0;
        const percentage = coinFlipTotal > 0 ? (data.count / coinFlipTotal) * 100 : 0;
        // Simplified long-term averages
        const coinFlipLongTermAverage = percentage;
        const coinFlipMultiplierLongTermAverage = avgMultiplier;
        const coinFlipFrequencyPercentage = percentage - coinFlipLongTermAverage;
        const coinFlipMultiplierFrequencyPercentage = ((avgMultiplier - coinFlipMultiplierLongTermAverage) / coinFlipMultiplierLongTermAverage) * 100;

        return {
            symbol,
            avgMultiplier: Number(avgMultiplier.toFixed(2)),
            count: data.count,
            percentage: Number(percentage.toFixed(2)),
            coinFlipFrequencyPercentage: Number(coinFlipFrequencyPercentage.toFixed(2)),
            coinFlipMultiplierFrequencyPercentage: Number(coinFlipMultiplierFrequencyPercentage.toFixed(2)),
            coinFlipMultiplierLongTermAverage: Number(coinFlipMultiplierLongTermAverage.toFixed(2)),
            coinFlipPercentageLongTermAverage: Number(coinFlipLongTermAverage.toFixed(2))
        };
    });

    return {
        totalCount,
        aggStats,
        bestMultipliers,
        topSlotToWheelResultStats,
        bestIndividualWins,
        cashHuntAvgStatsByPosition,
        cashHuntSymbolStats,
        crazyBonusFlapperStats,
        coinFlipStats
    };
}
