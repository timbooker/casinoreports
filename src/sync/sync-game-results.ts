import axios from "axios";
import { prisma } from "../prisma";
import { GameResult } from "../types/game-result";
import { AxiosResponse } from "axios";
import { CasinoGame } from "@prisma/client";

export async function syncGameResults() {
    console.log("Syncing game results...");

    const games = await prisma.casinoGame.findMany();

    await Promise.allSettled(
        games.map(async (game) => {
            const fetchURL = game.fetch_results_url;

            if (!fetchURL) {
                console.warn(`No fetch URL found for casino game: ${game.name}`);
                return;
            }

            const response: AxiosResponse<Array<GameResult>> = await axios.get(fetchURL);

            await Promise.allSettled(
                response.data.map(async (result) => {
                    await syncGameResult(result, game);
                })
            );
        })
    );

    console.log("Game results synced");
}

async function syncGameResult(result: GameResult, game: CasinoGame) {
    try {
        const gameResult = await prisma.gameResult.findFirst({
            where: { external_id: result.id, casino_game_id: game.id }
        });

        if (!gameResult) {
            await prisma.gameResult.create({
                data: {
                    casino_game_id: game.id,
                    external_id: result.id,
                    started_at: new Date(result.data.startedAt),
                    settled_at: new Date(result.data.settledAt),
                    status: result.data.status,
                    result: JSON.parse(JSON.stringify(result.data.result)),
                    total_winners: result.totalWinners ?? null,
                    total_amount: result.totalAmount ?? null,
                    winners: result.winners ? JSON.parse(JSON.stringify(result.winners)) : null,
                    data_raw: JSON.parse(JSON.stringify(result.data))
                }
            });

            console.log(`Created game result with id ${result.id} for game: ${game.name}`);
        } else {
            await prisma.gameResult.update({
                where: { id: gameResult.id },
                data: {
                    result: JSON.parse(JSON.stringify(result.data.result)),
                    status: result.data.status,
                    settled_at: new Date(result.data.settledAt),
                    started_at: new Date(result.data.startedAt),
                    total_winners: result.totalWinners ?? null,
                    total_amount: result.totalAmount ?? null,
                    winners: result.winners ? JSON.parse(JSON.stringify(result.winners)) : null,
                    data_raw: JSON.parse(JSON.stringify(result.data))
                }
            });

            console.log(`Updated game result with id ${result.id} for game: ${game.name}`);
        }
    } catch (error) {
        console.error(`Error syncing game result with id ${result.id} for game: ${game.name}`, error);
    }
}
