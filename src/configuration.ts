import { env } from "@/environment";
import type { ImperiaClientOptions } from "@/internal/extensions/client";
import { LogLevel } from "@sapphire/framework";
import { ActivityType, GatewayIntentBits } from "discord.js";

export const configuration: ImperiaClientOptions = {
    overrideApplicationCommandsRegistries: env.NODE_ENV === "development",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    loadSubcommandErrorListeners: true,
    loadDefaultErrorListeners: true,
    defaultPrefix: "ii.",
    presence: {
        activities: [
            {
                type: ActivityType.Playing,
                name: "with reality, the manifested. ✨",
            },
        ],
        status: "dnd",
    },
    typing: true,
    logger: {
        level: env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
    },
};
