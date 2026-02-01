import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { GAME_SHOWS } from "../constants/game-shows";
import { getBiggestWins } from "../utils/aggregate-game-stats";

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
 *         description: Number of wins to return (max 10)
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: number
 *         description: Duration in hours (max 30 days = 720 hours)
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

        const now = new Date();
        const durationDate = new Date(now.getTime() - duration * 60 * 60 * 1000);

        // Convert game show names to api_name format (lowercase, replace underscores)
        const gameShowApiNames = GAME_SHOWS.map(show => 
            show.toLowerCase().replace(/_/g, "")
        );

        // Find games that match the game shows
        const games = await prisma.casinoGame.findMany({
            where: {
                api_name: {
                    in: gameShowApiNames
                }
            }
        });

        if (games.length === 0) {
            res.status(200).json([]);
            return;
        }

        const gameIds = games.map((g: { id: string }) => g.id);
        const gameMap = new Map<string, string>(
            games.map((g: { id: string; api_name: string }) => [g.id, g.api_name])
        );

        // Get all results with multipliers, ordered by settledAt
        const results = await prisma.gameResult.findMany({
            where: {
                casino_game_id: {
                    in: gameIds
                },
                settled_at: {
                    gte: durationDate
                }
            },
            orderBy: [
                { settled_at: "desc" }
            ],
            take: size * 20 // Get more to filter by multiplier
        });

        // Transform and get biggest wins using utility function
        const wins = getBiggestWins(results, gameMap, size);

        res.status(200).json(wins);
    } catch (error) {
        console.error("Error fetching biggest wins:", error);
        res.status(500).json({ error: "Failed to fetch biggest wins." });
    }
});

export default BiggestWinsRouter;
