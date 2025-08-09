import { Request, Response, Router } from "express";
import { CASINO_GAME_SIMULATOR_BASE_URL, CommonHeaders } from "../constants/casino.api";
import axios from "axios";

const SimulatorRouter = Router();

/**
 * @swagger
 * /api/simulator/ct:
 *   get:
 *     summary: Get the current state of the Crazy Time simulator
 *     description: Retrieves the current state of the Crazy Time simulator
 *     tags: [Simulator]
 *     responses:
 *       200:
 *         description: Crazy Time simulator state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Failed to fetch casino game simulator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
SimulatorRouter.get("/simulator/ct", async (req: Request, res: Response) => {
    try {
        const URL = `${CASINO_GAME_SIMULATOR_BASE_URL}/ct`;
        const response = await axios.get(URL, {
            headers: CommonHeaders
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching casino game simulator:", error);
        res.status(500).json({ error: "Failed to fetch casino game simulator." });
    }
});

export default SimulatorRouter;
