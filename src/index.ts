import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import dotenv from "dotenv";

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
                        id: { type: "string" },
                        name: { type: "string" },
                        type: { type: "string" },
                        provider: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
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

app.listen(PORT, () => {
    console.log(`Proxy API server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
