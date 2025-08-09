import { Router, Request, Response } from "express";
import axios from "axios";
import { getCacheProvider } from "../cache";
import { GamesRouter } from "./games.route";
import BiggestWinsRouter from "./biggest-wins.route";
import PlayersRouter from "./players.route";
import { CASINO_SCORE_BASE_URL } from "../constants/casino.api";
import CMSRouter from "./cms.route";
import SimulatorRouter from "./simulator.route";

const router = Router();
const cache = getCacheProvider();

const PLAYERCOUNT_CACHE_SECONDS = parseInt(process.env.PLAYERCOUNT_CACHE_SECONDS || "", 10) || 10;
const CRAZYTIME_CACHE_SECONDS = parseInt(process.env.CRAZYTIME_CACHE_SECONDS || "", 10) || 30;
const GAME_RESULTS_CACHE_SECONDS = parseInt(process.env.GAME_RESULTS_CACHE_SECONDS || "", 10) || 30;

const getApiHeaders = () => ({
    "User-Agent": "casino-tracker/1.0",
    Accept: "application/json",
    "Content-Type": "application/json"
});

async function cacheAndFetch(
    res: Response,
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<any>,
    cacheLabel: string
) {
    try {
        let cached: string | null = null;
        try {
            cached = await cache.get(cacheKey);
        } catch (cacheErr) {
            console.warn(`Cache unavailable, skipping cache for ${cacheLabel}:`, cacheErr);
        }
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }
        const data = await fetchFn();
        try {
            await cache.set(cacheKey, JSON.stringify(data), ttl);
        } catch (cacheErr) {
            console.warn(`Cache unavailable, could not set cache for ${cacheLabel}:`, cacheErr);
        }
        res.json(data);
    } catch (error) {
        console.error(`Error proxying ${cacheLabel}:`, error);
        res.status(500).json({ error: `Failed to fetch ${cacheLabel} from external API.` });
    }
}

router.use(GamesRouter);
router.use(BiggestWinsRouter);
router.use(PlayersRouter);
router.use(CMSRouter);
router.use(SimulatorRouter);

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get API version
 *     description: Returns the current API version and deployment info
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Version info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                 deployedAt:
 *                   type: string
 *                 fixes:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/version", async (_req: Request, res: Response) => {
    res.json({
        version: "1.0.2",
        deployedAt: new Date().toISOString(),
        timestamp: Date.now(),
        fixes: [
            "Fixed IP extraction for geo/identify endpoint",
            "Fixed URL parameter encoding for halloffame endpoint",
            "Added proper HTTP headers for external API calls"
        ]
    });
});

/**
 * @swagger
 * /api/geo/identify:
 *   get:
 *     summary: Identify user location based on IP address
 *     description: Determines the geographical location of a user based on their IP address. Automatically detects the client's IP address.
 *     tags: [Geolocation]
 *     responses:
 *       200:
 *         description: Location information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeoResponse'
 *       500:
 *         description: Failed to fetch location data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/geo/identify", async (req: Request, res: Response) => {
    // Get IP from headers or socket, no body needed for GET request
    let ip = (req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.socket.remoteAddress ||
        "unknown") as string;

    // Extract first IP if multiple are present (e.g., "ip1, ip2, ip3")
    if (ip && ip.includes(",")) {
        ip = ip.split(",")[0].trim();
    }

    const cacheKey = `geo:identify:${ip}`;

    await cacheAndFetch(
        res,
        cacheKey,
        30, // cache TTL in seconds (adjust as needed)
        async () => {
            const response = await axios.get(`${CASINO_SCORE_BASE_URL}/neptune-svc-geo/api/geo/identify`, {
                params: { ip },
                headers: getApiHeaders()
            });
            return response.data;
        },
        `geo identify for ${ip}`
    );
});

/**
 * @swagger
 * /api/cache/status:
 *   get:
 *     summary: Get cache status
 *     description: Retrieves the current cache configuration and status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Cache status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheStatus'
 */
router.get("/cache/status", async (_req: Request, res: Response) => {
    res.json({
        cacheType: cache.getType(),
        config: {
            cacheProvider: process.env.CACHE_PROVIDER || "memory",
            redisUrl: process.env.REDIS_URL || "default",
            playercountCacheSeconds: PLAYERCOUNT_CACHE_SECONDS,
            crazytimeCacheSeconds: CRAZYTIME_CACHE_SECONDS,
            gameResultsCacheSeconds: GAME_RESULTS_CACHE_SECONDS
        }
    });
});

export default router;
