import Redis from "ioredis";

/**
 * Cache the data store connection in development.
 * This avoids creating a new connection on every HMR update.
 */
const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const dragonflyClient =
    globalForRedis.redis ??
    new Redis({
        host: Bun.env.DRAGONFLY_HOST,
        port: Bun.env.DRAGONFLY_PORT,
        enableReadyCheck: true,
        lazyConnect: true,
    });

if (Bun.env.NODE_ENV !== "production") globalForRedis.redis = dragonflyClient;
