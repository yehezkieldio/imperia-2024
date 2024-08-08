import Redis from "ioredis";

export const dragonflyClient = new Redis({
    host: Bun.env.DRAGONFLY_HOST,
    port: Bun.env.DRAGONFLY_PORT,
    enableReadyCheck: true,
    lazyConnect: true,
});
