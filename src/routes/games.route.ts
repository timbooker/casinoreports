import { Request, Response } from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const GamesRouter = Router();
const prisma = new PrismaClient();

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

export default GamesRouter;
