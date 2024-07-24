import { env } from "@/environment";
import Redis from "ioredis";

export const dragonfly = new Redis({
    host: env.DRAGONFLY_HOST,
    port: env.DRAGONFLY_PORT,
});
