import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import dotenv from "dotenv";
import { seedDatabase } from "./seed-database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Casino Tracker API",
            version: "1.0.0",
            description: "API for tracking casino games and player data",
            contact: {
                name: "API Support",
                email: "support@casinotracker.com"
            }
        },
        servers: [
            // TODO: Uncomment this when developing locally

            // {
            //   url: 'https://casino-tracker-api.onrender.com',
            //   description: 'Production server'
            // },
            {
                url: `http://localhost:${PORT}`,
                description: "Development server"
            }
        ],
        components: {
            schemas: {
                GeoResponse: {
                    type: "object",
                    properties: {
                        country: { type: "string" },
                        region: { type: "string" },
                        city: { type: "string" },
                        ip: { type: "string" }
                    }
                },
                PlayerCount: {
                    type: "object",
                    properties: {
                        count: { type: "number" },
                        timestamp: { type: "string", format: "date-time" }
                    }
                },
                GameResult: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        gameType: { type: "string" },
                        result: { type: "string" },
                        multiplier: { type: "number" },
                        settledAt: { type: "string", format: "date-time" }
                    }
                },
                CasinoGame: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Unique identifier for the casino game" },
                        name: { type: "string", description: "Display name of the game (e.g. 'Live Craps')" },
                        description: { type: "string", nullable: true, description: "Game description" },
                        api_name: {
                            type: "string",
                            description: "API identifier for the game (e.g. 'sweetbonanzacandyland')"
                        },
                        logo: { type: "string", nullable: true, description: "URL to logo image" },
                        category: {
                            type: "string",
                            enum: ["LIVE STREAMS", "TRACKED GAME SHOWS"],
                            description: "Game category"
                        },
                        rtp: { type: "string", nullable: true, description: "Return to Player percentage" },
                        max_win: { type: "number", nullable: true, description: "Maximum win multiplier or amount" },
                        min_stake: { type: "number", nullable: true, description: "Minimum stake amount" },
                        max_take: { type: "number", nullable: true, description: "Maximum take amount" },
                        release_date: { type: "string", nullable: true, description: "Game release date" },
                        provider: { type: "string", nullable: true, description: "Game provider" },
                        features: {
                            type: "array",
                            nullable: true,
                            items: { type: "string" },
                            description:
                                "Array of game features (e.g. ['Cash Hunt', 'Coin Flip', 'Pachinko', 'Crazy Time'])"
                        },
                        is_new: { type: "boolean", description: "Whether the game is new", default: false },
                        fetch_results_url: {
                            type: "string",
                            nullable: true,
                            description: "URL to fetch results for this game"
                        },
                        created_at: { type: "string", format: "date-time", description: "Creation timestamp" },
                        updated_at: { type: "string", format: "date-time", description: "Last update timestamp" }
                    }
                },
                CacheStatus: {
                    type: "object",
                    properties: {
                        cacheType: { type: "string" },
                        config: {
                            type: "object",
                            properties: {
                                cacheProvider: { type: "string" },
                                redisUrl: { type: "string" },
                                playercountCacheSeconds: { type: "number" },
                                crazytimeCacheSeconds: { type: "number" },
                                gameResultsCacheSeconds: { type: "number" }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ["./src/routes.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api", routes);

app.listen(PORT, async () => {
    console.log(`Proxy API server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

    // Seed the database on startup
    await seedDatabase();
});
