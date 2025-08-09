import axios, { AxiosResponse } from "axios";
import { Router, Request, Response } from "express";
import { GameShowWin } from "../types/game-show-win";
import { CASINO_SCORE_BASE_URL } from "../constants/casino.api";
import { GAME_SHOWS } from "../constants/game-shows";

const BiggestWinsRouter = Router();

const MAX_DURATION_IN_HOURS = 30 * 24; // 30 days
const MAX_SIZE = 10;

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
        let size = Number(req.query.size) || 4; // number of wins to return
        let duration = Number(req.query.duration) || 24; // in hours

        if (duration > MAX_DURATION_IN_HOURS) {
            duration = MAX_DURATION_IN_HOURS;
        }

        if (size > MAX_SIZE) {
            size = MAX_SIZE;
        }

        const params = new URLSearchParams({
            size: size.toString(),
            duration: duration.toString(),
            gameShows: GAME_SHOWS.join(",")
        });

        params.append("sort", "multiplier,desc");
        params.append("sort", "settledAt,desc");

        const URL = `${CASINO_SCORE_BASE_URL}/cg-neptune-notification-center/api/halloffame/latest`;
        const response: AxiosResponse<Array<GameShowWin>> = await axios.get(`${URL}?${params.toString()}`);

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching biggest wins:", error);
        res.status(500).json({ error: "Failed to fetch biggest wins." });
    }
});

export default BiggestWinsRouter;
