const PORT = process.env.PORT || 3000;

export const SwaggerOptions = {
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
            {
                url: "https://casinoreports-vdmg.onrender.com/",
                description: "Production Server"
            },
            {
                url: `http://localhost:${PORT}`,
                description: "Development Server"
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
                },
                GameShowWin: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        gameShowEventId: { type: "string" },
                        gameShow: { type: "string" },
                        multiplier: { type: "number" },
                        startedAt: { type: "string", format: "date-time" },
                        settledAt: { type: "string", format: "date-time" },
                        durationInSeconds: { type: "number" },
                        spinOutcome: { type: "string" },
                        position: { type: "number" },
                        type: { type: "string" },
                        streamUrl: { type: "string" },
                        thumbnailUrl: { type: "string" },
                        totalWinners: { type: "number" },
                        totalAmount: { type: "number" },
                        bettorsCount: { type: "number" },
                        winners: { type: "array", items: { type: "object" } }
                    }
                }
            }
        }
    },
    apis: ["./src/routes/*.ts"]
};
