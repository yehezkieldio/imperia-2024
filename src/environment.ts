import { createEnv } from "@t3-oss/env-core";
import { type ZodError, z } from "zod";

/**
 * The environment variables that the application requires.
 */
export const env = createEnv({
    server: {
        /**
         * This is the environment that the application is running in.
         */
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        /**
         * This is the token that the bot will use to authenticate with Discord.
         * @link https://discord.com/developers/applications
         */
        DISCORD_TOKEN: z.string().min(1),
        /**
         * This is the database URL that the application will use to connect to the database.
         * It should be in the format of `postgres://username:password@host:port/database`.
         */
        DATABASE_URL: z.string().url(),
        /**
         * This is the host that the Dragonfly server is running on.
         * Redis may also work, but you need modules like RediSearch to be installed.
         */
        DRAGONFLY_HOST: z.string().min(1),
        /**
         * This is the port that the Dragonfly server is running on.
         */
        DRAGONFLY_PORT: z.coerce.number().int().min(1).max(6379).default(6379),
        /**
         * This is the host and port that the Lavalink server is running on.
         */
        LAVALINK_URL: z.string().min(1),
        /**
         * This is the name of the Lavalink server.
         */
        LAVALINK_NAME: z.string().min(1).default("imperia"),
        /**
         * This is the password that the Lavalink server will use to authenticate with the bot.
         */
        LAVALINK_AUTH: z.string().min(1),
    },
    runtimeEnv: process.env,
    onValidationError: (error: ZodError) => {
        const errors = error.flatten().fieldErrors;

        for (const key of Object.keys(errors)) {
            if (typeof key === "string") {
                if (errors[key]?.includes("Required")) {
                    console.error(`Missing environment variable ${key} is required!`);
                } else {
                    console.log(`Error in environment variable ${key}: ${errors[key]}`);
                }
            }
        }

        throw new Error("Invalid environment variables.");
    },
});
