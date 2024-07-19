import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DISCORD_TOKEN: z.string().min(1),
        DATABASE_URL: z.string().url(),
        DRAGONFLY_HOST: z.string().min(1),
        DRAGONFLY_PORT: z.coerce.number().int().min(1).max(6379),
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    },
    runtimeEnv: process.env,
});
