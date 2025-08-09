import { Request, Response } from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { CASINO_SCORE_GAME_EVENTS_BASE_URL, CommonHeaders } from "../constants/casino.api";
import axios from "axios";
import { getPageParams } from "../utils/get-page-params";

export const GamesRouter = Router();
const prisma = new PrismaClient();

const MAX_SIZE = 100;
const MAX_DURATION = 30 * 24;

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all casino games
 *     description: Retrieves all casino games from the database
 *     tags: [Casino Games]
 *     responses:
 *       200:
 *         description: Casino games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CasinoGame'
 *       500:
 *         description: Failed to fetch casino games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games", async (_req: Request, res: Response) => {
    try {
        const games = await prisma.casinoGame.findMany();
        res.json(games);
    } catch (error) {
        console.error("Error fetching casino games:", error);
        res.status(500).json({ error: "Failed to fetch casino games." });
    }
});

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Get a single casino game by ID
 *     description: Retrieves a specific casino game by its unique identifier
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game ID
 *     responses:
 *       200:
 *         description: Casino game retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CasinoGame'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/:id", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findUnique({ where: { id: req.params.id } });

        if (!game) {
            res.status(404).json({ error: "Casino game not found." });
            return;
        }

        res.json(game);
    } catch (error) {
        console.error("Error fetching casino game:", error);
        res.status(500).json({ error: "Failed to fetch casino game." });
    }
});

/**
 * @swagger
 * /api/games/name/{name}:
 *   get:
 *     summary: Get a single casino game by name or api_name
 *     description: Retrieves a specific casino game by its name or api_name
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game name or api_name
 *     responses:
 *       200:
 *         description: Casino game retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CasinoGame'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/name/:name", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findFirst({
            where: {
                OR: [{ name: req.params.name }, { api_name: req.params.name }]
            }
        });

        if (!game) {
            res.status(404).json({
                error: "Casino game with name or api_name not found.",
                name: req.params.name
            });

            return;
        }

        res.json(game);
    } catch (error) {
        console.error("Error fetching casino game:", error);
        res.status(500).json({ error: "Failed to fetch casino game." });
    }
});

/**
 * @swagger
 * /api/games/{id}/results:
 *   get:
 *     summary: Get all results for a casino game by ID
 *     description: Retrieves all results for a specific casino game by its unique identifier
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game ID
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: number
 *         description: "The number of results to return (default: 10)"
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: number
 *         description: "Duration in hours to return results (default: 12, max: 720). Example: 3 days = 72 hours"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *         description: "The page number to return (default: 0)"
 *     responses:
 *       200:
 *         description: Casino game results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/:id/results", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findUnique({ where: { id: req.params.id } });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", id: req.params.id });
            return;
        }

        if (!game.fetch_results_url) {
            res.status(404).json({ error: "Casino game fetch results URL not found.", id: req.params.id });
            return;
        }

        const { size, duration, page } = getPageParams(req, MAX_SIZE, MAX_DURATION);

        const params = new URLSearchParams({
            size: size.toString(),
            sort: "data.settledAt,desc",
            duration: duration.toString(),
            page: page.toString()
        });

        const URL = `${game.fetch_results_url}?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game results:", error);
        res.status(500).json({ error: "Failed to fetch casino game results." });
    }
});

/**
 * @swagger
 * /api/games/{id}/results/latest:
 *   get:
 *     summary: Get the latest results for a casino game by ID
 *     description: Retrieves the latest results for a specific casino game by its unique identifier. By default, the latest results are the most recent 10 results sorted by settledAt in descending order.
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game ID
 *     responses:
 *       200:
 *         description: Casino game results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/:id/results/latest", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findFirst({ where: { id: req.params.id } });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", id: req.params.id });
            return;
        }

        const duration = Number(req.query.duration) || 6;

        const params = new URLSearchParams({
            size: "10",
            page: "0",
            sort: "data.settledAt,desc",
            duration: duration.toString()
        });

        const URL = `${game.fetch_results_url}?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game results:", error);
        res.status(500).json({ error: "Failed to fetch casino game results." });
    }
});

/**
 * @swagger
 * /api/games/{id}/stats:
 *   get:
 *     summary: Get the stats for a casino game by ID
 *     description: Retrieves the stats for a specific casino game by its unique identifier
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game ID
 *     responses:
 *       200:
 *         description: Casino game stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/:id/stats", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findUnique({ where: { id: req.params.id } });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", id: req.params.id });
            return;
        }

        const params = new URLSearchParams({
            sort: "hotFrequency"
        });

        const URL = `${CASINO_SCORE_GAME_EVENTS_BASE_URL}/${game.api_name}/stats?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game stats:", error);
        res.status(500).json({ error: "Failed to fetch casino game stats." });
    }
});

/**
 * @swagger
 * /api/games/name/{name}/results:
 *   get:
 *     summary: Get all results for a casino game by name or api_name
 *     description: Retrieves all results for a specific casino game by its name or api_name. The results are sorted by settledAt in descending order, returning the most recent results.
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game name or api_name
 *       - in: query
 *         name: size
 *         required: false
 *         default: 10
 *         schema:
 *           type: number
 *         description: "The number of results to return (default: 10)"
 *       - in: query
 *         name: duration
 *         required: false
 *         default: 12
 *         schema:
 *           type: number
 *         description: "Duration in hours to return results (default: 12, max: 720). Example: 3 days = 72 hours"
 *       - in: query
 *         name: page
 *         required: false
 *         default: 0
 *         schema:
 *           type: number
 *         description: The page number to return
 *     responses:
 *       200:
 *         description: Casino game results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/name/:name/results", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findFirst({
            where: {
                OR: [{ name: req.params.name }, { api_name: req.params.name }]
            }
        });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", name: req.params.name });
            return;
        }

        const { size, duration, page } = getPageParams(req, MAX_SIZE, MAX_DURATION);

        const params = new URLSearchParams({
            size: size.toString(),
            sort: "data.settledAt,desc",
            duration: duration.toString(),
            page: page.toString()
        });

        const URL = `${game.fetch_results_url}?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game results:", error);
        res.status(500).json({ error: "Failed to fetch casino game results." });
    }
});

/**
 * @swagger
 * /api/games/name/{name}/results/latest:
 *   get:
 *     summary: Get the latest results for a casino game by name or api_name
 *     description: Retrieves the latest results for a specific casino game by its name or api_name. By default, the latest results are the most recent 10 results sorted by settledAt in descending order.
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game name or api_name
 *     responses:
 *       200:
 *         description: Casino game results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       404:
 *         description: Casino game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/name/:name/results/latest", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findFirst({
            where: {
                OR: [{ name: req.params.name }, { api_name: req.params.name }]
            }
        });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", name: req.params.name });
            return;
        }

        if (!game.fetch_results_url) {
            res.status(404).json({ error: "Casino game fetch results URL not found.", name: req.params.name });
            return;
        }

        const params = new URLSearchParams({
            size: "10",
            page: "0",
            sort: "data.settledAt,desc"
        });

        const URL = `${game.fetch_results_url}?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game results:", error);
        res.status(500).json({ error: "Failed to fetch casino game results." });
    }
});

/**
 * @swagger
 * /api/games/name/{name}/stats:
 *   get:
 *     summary: Get the stats for a casino game by name or api_name
 *     description: Retrieves the stats for a specific casino game by its name or api_name
 *     tags: [Casino Games]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The casino game name or api_name
 *     responses:
 *       200:
 *         description: Casino game stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch casino game stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
GamesRouter.get("/games/name/:name/stats", async (req: Request, res: Response) => {
    try {
        const game = await prisma.casinoGame.findFirst({
            where: {
                OR: [{ name: req.params.name }, { api_name: req.params.name }]
            }
        });

        if (!game) {
            res.status(404).json({ error: "Casino game not found.", name: req.params.name });
            return;
        }

        const params = new URLSearchParams({
            sort: "hotFrequency"
        });

        const URL = `${CASINO_SCORE_GAME_EVENTS_BASE_URL}/${game.api_name}/stats?${params.toString()}`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game stats:", error);
        res.status(500).json({ error: "Failed to fetch casino game stats." });
    }
});

export default GamesRouter;
