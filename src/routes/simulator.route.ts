import { Request, Response, Router } from "express";
import { CASINO_GAME_SIMULATOR_BASE_URL, CommonHeaders } from "../constants/casino.api";
import axios, { AxiosError } from "axios";

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
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                Accept: "*/*",
                "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                Origin: "https://casinoscores.com",
                Referer: "https://casinoscores.com/",
                "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                priority: "u=1, i"
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching casino game simulator:", error);

        if (error instanceof AxiosError && error.response) {
            console.error(error.response.data);
            res.status(500).json({ error: "Failed to fetch casino game simulator." });
        } else {
            res.status(500).json({ error: "Failed to fetch casino game simulator." });
        }
    }
});

export default SimulatorRouter;
