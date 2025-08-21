import { CasinoGame, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { GameResult } from "../types/game-result";
import { AxiosResponse } from "axios";
import { createBrightDataAxiosInstance } from "../constants/casino.api";

export async function main() {
    console.log("Syncing Casino Game results...");

    try {
        const games = await prisma.casinoGame.findMany();

        await Promise.allSettled(
            games.map(async (game) => {
                await syncGameResults(game);
            })
        );

        console.log("Casino Game results synced");
    } catch (error) {
        console.error("Error syncing game results:", error);
    } finally {
        await prisma.$disconnect();
    }
}

export async function syncGameResults(game: CasinoGame) {
    const fetchURL = game.fetch_results_url;

    if (!fetchURL) {
        console.warn(`No fetch URL found for casino game: ${game.name}`);
        return;
    }

    try {
        const params = new URLSearchParams({
            size: "10",
            sort: "data.settledAt,desc"
        });

        const URL = `${fetchURL}?${params.toString()}`;
        const casinoAxios = createBrightDataAxiosInstance();
        const response: AxiosResponse<Array<GameResult>> = await casinoAxios.get(URL);

        await Promise.allSettled(
            response.data.map(async (result) => {
                await syncGameResult(result, game);
            })
        );
    } catch (error) {
        console.error(`Error syncing game results for game: ${game.name}`, error);
    }
}

async function syncGameResult(result: GameResult, game: CasinoGame) {
    try {
        await prisma.gameResult.upsert({
            where: { casino_game_id_external_id: { casino_game_id: game.id, external_id: result.id } },
            update: {
                status: result.data.status,
                settled_at: new Date(result.data.settledAt),
                result: result.data.result as Prisma.JsonObject,
                total_winners: result.totalWinners ?? null,
                total_amount: result.totalAmount ?? null,
                winners: (result.winners as Prisma.JsonArray) || undefined,
                data_raw: result.data as Prisma.JsonObject
            },
            create: {
                casino_game_id: game.id,
                external_id: result.id,
                started_at: new Date(result.data.startedAt),
                settled_at: new Date(result.data.settledAt),
                status: result.data.status,
                result: result.data.result as Prisma.JsonObject,
                total_winners: result.totalWinners ?? null,
                total_amount: result.totalAmount ?? null,
                winners: (result.winners as Prisma.JsonArray) ?? null,
                data_raw: result.data as Prisma.JsonObject
            }
        });
    } catch (error) {
        console.error(`Error syncing game result with id ${result.id} for game: ${game.name}`, error);
        throw error;
    }
}

main();
