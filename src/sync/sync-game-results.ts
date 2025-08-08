import axios from "axios";
import { prisma } from "../prisma";
import { GameResult } from "../types/game-result";
import { AxiosResponse } from "axios";

async function syncGameResults() {
    const games = await prisma.casinoGame.findMany();

    await Promise.all(
        games.map(async (game) => {
            const fetchURL = game.fetch_results_url;

            if (!fetchURL) {
                console.warn(`No fetch URL found for casino game: ${game.name}`);
                return;
            }

            const response: AxiosResponse<Array<GameResult>> = await axios.get(fetchURL);

            console.log(response.data);
        })
    );

    // for (const game of GAME_CONFIGS) {
    //     try {
    //         const casinoGame = await prisma.casinoGame.findFirst({ where: { api_name: game.apiName } });

    //         if (!casinoGame) {
    //             console.warn(`CasinoGame not found for apiName: ${game.apiName}`);
    //             continue;
    //         }

    //         const { data } = await axios.get(game.url);

    //         for (const result of data) {
    //             // Find or create GameResult by externalId and casinoGameId
    //             let gameResult = await prisma.gameResult.findFirst({
    //                 where: { externalId: result.id, casinoGameId: casinoGame.id }
    //             });

    //             const resultData = {
    //                 externalId: result.id,
    //                 startedAt: new Date(result.data.startedAt),
    //                 settledAt: new Date(result.data.settledAt),
    //                 status: result.data.status,
    //                 result: result.data.result || {},
    //                 casinoGameId: casinoGame.id
    //             };

    //             if (!gameResult) {
    //                 gameResult = await prisma.gameResult.create({
    //                     data: resultData
    //                 });
    //             } else {
    //                 gameResult = await prisma.gameResult.update({
    //                     where: { id: gameResult.id },
    //                     data: resultData
    //                 });
    //             }
    //         }
    //     } catch (err) {
    //         console.error(`Error syncing results for ${game.apiName}:`, err);
    //     }
    // }
}

// Run every minute
setInterval(syncGameResults, 60 * 1000);

// Run immediately on start
syncGameResults();
