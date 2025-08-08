import { Router, Request, Response } from 'express';
import axios from 'axios';
import { getCacheProvider } from '../cache';
import { PrismaClient } from '@prisma/client';
import cmsDocuments from '../payload/cms/documents1.json';
import navMenu from '../payload/cms/menu.json'
import { GamesRouter } from './games.route';

const router = Router();
const cache = getCacheProvider();
const prisma = new PrismaClient();

const PLAYERCOUNT_CACHE_SECONDS = parseInt(process.env.PLAYERCOUNT_CACHE_SECONDS || '', 10) || 10;
const CRAZYTIME_CACHE_SECONDS = parseInt(process.env.CRAZYTIME_CACHE_SECONDS || '', 10) || 30;
const GAME_RESULTS_CACHE_SECONDS = parseInt(process.env.GAME_RESULTS_CACHE_SECONDS || '', 10) || 30;
const CASINO_SCORE_URL = 'https://api.casinoscores.com';

// Common headers for API requests
const getApiHeaders = () => ({
  'User-Agent': 'casino-tracker/1.0',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
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
router.get('/version', async (_req: Request, res: Response) => {
  res.json({
    version: '1.0.2',
    deployedAt: new Date().toISOString(),
    timestamp: Date.now(),
    fixes: [
      'Fixed IP extraction for geo/identify endpoint',
      'Fixed URL parameter encoding for halloffame endpoint',
      'Added proper HTTP headers for external API calls'
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
router.get('/geo/identify', async (req: Request, res: Response) => {
  // Get IP from headers or socket, no body needed for GET request
  let ip = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown') as string;
  
  // Extract first IP if multiple are present (e.g., "ip1, ip2, ip3")
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  const cacheKey = `geo:identify:${ip}`;

  await cacheAndFetch(
    res,
    cacheKey,
    30, // cache TTL in seconds (adjust as needed)
    async () => {
      const response = await axios.get(
        `${CASINO_SCORE_URL}/neptune-svc-geo/api/geo/identify`,
        {
          params: { ip },
          headers: getApiHeaders()
        }
      );
      return response.data;
    },
    `geo identify for ${ip}`
  );
});

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get navigation menu
 *     description: Retrieves the navigation menu structure for the casino application
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Menu data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/menu', async (_req: Request, res: Response) => {
  res.json(navMenu);
});

/**
 * @swagger
 * /api/cms/documents:
 *   get:
 *     summary: Get CMS documents
 *     description: Retrieves CMS documents and content
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: CMS documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/cms/documents', async (_req: Request, res: Response) => {
  res.json(cmsDocuments);
});

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
router.get('/playercount/latest', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'playercount:latest',
    PLAYERCOUNT_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/cg-neptune-notification-center/api/evolobby/playercount/latest`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'playercount'
  );
});

/**
 * @swagger
 * /api/halloffame/latest:
 *   get:
 *     summary: Get latest hall of fame
 *     description: Retrieves the latest hall of fame entries with high multipliers
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Hall of fame data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch hall of fame data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/halloffame/latest', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'halloffame:latest',
    30, // cache duration in seconds
    async () => {
      // Manually construct URL to avoid Axios array parameter encoding issues
      const params = new URLSearchParams({
        duration: '10',
        size: '4',
        gameShows: 'CRAZY_TIME,CRAZY_TIME_A,MONOPOLY_LIVE,CASH_OR_CRASH_LIVE,LIGHTNING_BACCARAT,MONOPOLY_BIG_BALLER,FUNKY_TIME,RED_DOOR_ROULETTE,SWEET_BONANZA_CANDYLAND,MEGA_ROULETTE,TREASURE_ISLAND,LIGHTNING_STORM,ADVENTURE_BEYOND_WONDERLAND,FIREBALL_ROULETTE'
      });
      // Add sort parameters manually
      params.append('sort', 'multiplier,desc');
      params.append('sort', 'settledAt,desc');
      
      const url = `${CASINO_SCORE_URL}/cg-neptune-notification-center/api/halloffame/latest?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'hall of fame latest'
  );
});

/**
 * @swagger
 * /api/crazytime/results:
 *   get:
 *     summary: Get Crazy Time game results
 *     description: Retrieves recent Crazy Time game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Crazy Time results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Crazy Time results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/crazytime/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'crazytime:results',
    CRAZYTIME_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/crazytime?page=0&size=24&sort=data.settledAt,desc&duration=6&wheelResults=Pachinko,CashHunt,CrazyBonus,CoinFlip,1,2,5,10&isTopSlotMatched=true,false&tableId=CrazyTime0000001`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'crazytime results'
  );
});

/**
 * @swagger
 * /api/treasureisland/results:
 *   get:
 *     summary: Get Treasure Island game results
 *     description: Retrieves recent Treasure Island game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Treasure Island results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Treasure Island results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/treasureisland/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'treasureisland:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/treasureisland?page=0&size=10&sort=data.settledAt,desc&duration=30&wheelResults=1,2,5,10,Ben%27s%20Lost%20Marbles,John%20Silver%27s%20Loot,Billy%20Bones%27%20Map,Captain%20Flint%27s%20Treasure&isTopSlotMatched=true,false`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'treasure island results'
  );
});

/**
 * @swagger
 * /api/monopoly/results:
 *   get:
 *     summary: Get Monopoly game results
 *     description: Retrieves recent Monopoly game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Monopoly results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Monopoly results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/monopoly/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'monopoly:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/monopoly?page=0&size=25&sort=data.settledAt,desc&duration=6&wheelResults=1,2,5,10,2r,4r,ch`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'monopoly results'
  );
});

/**
 * @swagger
 * /api/lightningstorm/results:
 *   get:
 *     summary: Get Lightning Storm game results
 *     description: Retrieves recent Lightning Storm game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Lightning Storm results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Lightning Storm results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/lightningstorm/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'lightningstorm:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/lightningstorm?page=0&size=16&sort=data.settledAt,desc&duration=6&wheelResults=StormBonus,Fireball,MonsterMash,HotSpot,BatteryCharger,EvoLeaf`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'lightning storm results'
  );
});

/**
 * @swagger
 * /api/abwonderland/results:
 *   get:
 *     summary: Get Adventure Beyond Wonderland game results
 *     description: Retrieves recent Adventure Beyond Wonderland game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Adventure Beyond Wonderland results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Adventure Beyond Wonderland results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/abwonderland/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'abwonderland:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/abwonderland?page=0&size=16&sort=data.settledAt,desc&duration=6&wheelResults=ABW_WONDERSPINS_5,ABW_WOLTERSPINS,ABW_WONDERSPINS_2,ABW_MAGIC_DICE,ABW_10,ABW_5,ABW_2,ABW_1,ABW_CARD_SOLDIERS`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'ab wonderland results'
  );
});

/**
 * @swagger
 * /api/bigballer/results:
 *   get:
 *     summary: Get Big Baller game results
 *     description: Retrieves recent Big Baller game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Big Baller results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Big Baller results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/bigballer/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'bigballer:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/bigballer?page=0&size=14&sort=data.settledAt,desc&duration=6&isThreeRolls=true,false&isFiveRolls=true,false`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'big baller results'
  );
});

/**
 * @swagger
 * /api/sweetbonanza/results:
 *   get:
 *     summary: Get Sweet Bonanza game results
 *     description: Retrieves recent Sweet Bonanza game results and statistics
 *     tags: [Game Results]
 *     responses:
 *       200:
 *         description: Sweet Bonanza results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameResult'
 *       500:
 *         description: Failed to fetch Sweet Bonanza results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/sweetbonanza/results', async (_req: Request, res: Response) => {
  await cacheAndFetch(
    res,
    'sweetbonanza:results',
    GAME_RESULTS_CACHE_SECONDS,
    async () => {
      const response = await axios.get(`${CASINO_SCORE_URL}/svc-evolution-game-events/api/sweetbonanza?page=0&size=19&sort=data.settledAt,desc&duration=6&wheelResults=1,2,5,Bubble%20Surprise,Candy%20Drop,Sweet%20Spins&isSugarbomb=true,false`, {
        headers: getApiHeaders()
      });
      return response.data;
    },
    'sweet bonanza results'
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
router.get('/cache/status', async (_req: Request, res: Response) => {
  res.json({
    cacheType: cache.getType(),
    config: {
      cacheProvider: process.env.CACHE_PROVIDER || 'memory',
      redisUrl: process.env.REDIS_URL || 'default',
      playercountCacheSeconds: PLAYERCOUNT_CACHE_SECONDS,
      crazytimeCacheSeconds: CRAZYTIME_CACHE_SECONDS,
      gameResultsCacheSeconds: GAME_RESULTS_CACHE_SECONDS
    }
  });
});

export default router; 