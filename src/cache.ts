export interface CacheProvider {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds: number): Promise<void>;
    getType(): string;
}

class MemoryCache implements CacheProvider {
    private store: Map<string, { value: string; expiresAt: number }>;
    constructor() {
        this.store = new Map();
    }
    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    getType(): string {
        return "memory";
    }
}

class RedisCache implements CacheProvider {
    private redis: any;
    constructor(redisInstance: any) {
        this.redis = redisInstance;
    }
    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        await this.redis.set(key, value, "EX", ttlSeconds);
    }
    getType(): string {
        return "redis";
    }
}

class HotSwapCache implements CacheProvider {
    private currentCache: CacheProvider;
    private redis: any;
    private memoryCache: MemoryCache;

    constructor() {
        this.memoryCache = new MemoryCache();
        this.currentCache = this.memoryCache;
        this.initializeRedis();
    }

    private initializeRedis() {
        try {
            if (process.env.REDIS_URL) {
                this.redis = new Redis(process.env.REDIS_URL);
            } else {
                this.redis = new Redis();
            }

            this.redis.on("error", (err: any) => {
                console.warn("Redis connection error, switching to memory cache:", err);
                this.currentCache = this.memoryCache;
            });

            this.redis.on("connect", () => {
                console.log("Redis connected, switching to Redis cache");
                this.currentCache = new RedisCache(this.redis);
            });

            // Test initial connection
            this.redis
                .ping()
                .then(() => {
                    console.log("Redis ping successful, using Redis cache");
                    this.currentCache = new RedisCache(this.redis);
                })
                .catch((err: any) => {
                    console.warn("Redis ping failed, using memory cache:", err);
                    this.currentCache = this.memoryCache;
                });
        } catch (err) {
            console.warn("Failed to initialize Redis, using memory cache:", err);
            this.currentCache = this.memoryCache;
        }
    }

    async get(key: string): Promise<string | null> {
        return this.currentCache.get(key);
    }

    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        return this.currentCache.set(key, value, ttlSeconds);
    }

    getType(): string {
        return this.currentCache.getType();
    }
}

import Redis from "ioredis";

export function getCacheProvider(): CacheProvider {
    const provider = (process.env.CACHE_PROVIDER || "memory").toLowerCase();
    if (provider === "memory") {
        return new MemoryCache();
    } else if (provider === "redis") {
        try {
            let redis;
            if (process.env.REDIS_URL) {
                redis = new Redis(process.env.REDIS_URL);
            } else {
                redis = new Redis();
            }
            return new RedisCache(redis);
        } catch (err) {
            console.warn("Failed to initialize Redis, falling back to memory cache:", err);
            return new MemoryCache();
        }
    } else {
        // Default to hot-swap cache
        return new HotSwapCache();
    }
}
