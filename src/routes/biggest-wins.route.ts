import axios, { AxiosResponse } from "axios";
import { Router, Request, Response } from "express";
import { GameShowWin } from "../types/game-show-win";

const GAME_SHOWS = [
    "CRAZY_TIME",
    "CRAZY_TIME_A",
    "MONOPOLY_LIVE",
    "CASH_OR_CRASH_LIVE",
    "LIGHTNING_BACCARAT",
    "MONOPOLY_BIG_BALLER",
    "FUNKY_TIME",
    "RED_DOOR_ROULETTE",
    "SWEET_BONANZA_CANDYLAND",
    "MEGA_ROULETTE",
    "TREASURE_ISLAND",
    "LIGHTNING_STORM",
    "ADVENTURE_BEYOND_WONDERLAND",
    "FIREBALL_ROULETTE"
];

const BiggestWinsRouter = Router();

const URL = "https://api.casinoscores.com/cg-neptune-notification-center/api/halloffame/latest";

/**
 * @swagger
 * /api/biggest-wins/latest:
 *   get:
 *     summary: Get the latest biggest wins
 *     description: Retrieves the latest biggest wins from the API
 *     tags: [Biggest Wins]
 *     parameters:
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: number
 *         description: Number of wins to return
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: number
 *         description: Duration in hours
 *     responses:
 *       200:
 *         description: Biggest wins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameShowWin'
 *       500:
 *         description: Failed to fetch biggest wins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
BiggestWinsRouter.get("/biggest-wins/latest", async (req: Request, res: Response) => {
    try {
        const size = Number(req.query.size) || 4; // number of wins to return
        const duration = Number(req.query.duration) || 1; // in hours

        const params = new URLSearchParams({
            size: size.toString(),
            duration: duration.toString(),
            gameShows: GAME_SHOWS.join(",")
        });

        params.append("sort", "multiplier,desc");
        params.append("sort", "settledAt,desc");

        const response: AxiosResponse<Array<GameShowWin>> = await axios.get(`${URL}?${params.toString()}`);

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching biggest wins:", error);
        res.status(500).json({ error: "Failed to fetch biggest wins." });
    }
});

export default BiggestWinsRouter;
