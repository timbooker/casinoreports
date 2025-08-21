import { Request, Response, Router } from "express";
import { CASINO_SCORE_BASE_URL, createBrightDataAxiosInstance } from "../constants/casino.api";

const PlayersRouter = Router();

/**
 * @swagger
 * /api/playercount/latest:
 *   get:
 *     summary: Get latest player count
 *     description: Retrieves the current number of players across all casino games
 *     tags: [Player Data]
 *     responses:
 *       200:
 *         description: Player count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerCount'
 *       500:
 *         description: Failed to fetch player count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
PlayersRouter.get("/playercount/latest", async (_req: Request, res: Response) => {
    try {
        const URL = `${CASINO_SCORE_BASE_URL}/cg-neptune-notification-center/api/evolobby/playercount/latest`;
        const casinoAxios = createBrightDataAxiosInstance();
        const response = await casinoAxios.get(URL);

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching player count:", error);
        res.status(500).json({ error: "Failed to fetch player count" });
    }
});

export default PlayersRouter;
