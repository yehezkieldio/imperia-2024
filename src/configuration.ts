import { env } from "@/environment";
import { DEVELOPERS } from "@/internal/constants/developers";
import type { ImperiaClientOptions } from "@/internal/extensions/client";
import { LogLevel } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";

export const configuration: ImperiaClientOptions = {
    allowedMentions: {
        users: [],
        roles: [],
    },
    overrideApplicationCommandsRegistries: env.NODE_ENV === "development",
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Channel, Partials.GuildMember],
    loadMessageCommandListeners: true,
    loadSubcommandErrorListeners: true,
    loadDefaultErrorListeners: true,
    defaultCooldown: {
        delay: Time.Second * 2,
        filteredUsers: DEVELOPERS,
    },
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
