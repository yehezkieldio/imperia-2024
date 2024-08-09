import type { ImperiaClientOptions } from "@/lib/extensions/client";
import { LogLevel } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";

export const DEVELOPERS: string[] = ["327849142774923266"];
export const DEVELOPMENT_SERVERS: string[] = ["1209737959587450980"];

/**
 * The configuration for the bot.
 */
export const configuration: ImperiaClientOptions = {
    allowedMentions: {
        parse: [],
        users: [],
        roles: [],
        repliedUser: true,
    },
    defaultCooldown: {
        delay: Time.Second * 2,
        filteredUsers: DEVELOPERS,
    },
    defaultPrefix: "imperia ",
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    loadApplicationCommandRegistriesStatusListeners: Bun.env.NODE_ENV === "development",
    loadDefaultErrorListeners: Bun.env.NODE_ENV === "development",
    loadSubcommandErrorListeners: true,
    loadMessageCommandListeners: true,
    logger: {
        level: Bun.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info,
    },
    overrideApplicationCommandsRegistries: Bun.env.NODE_ENV === "development",
    partials: [Partials.Message, Partials.User, Partials.GuildMember],
    presence: {
        activities: [
            {
                type: ActivityType.Listening,
                name: "reality, the manifested. ✨",
            },
        ],
        status: "dnd",
    },
    subcommandDefaultCooldown: {
        delay: Time.Second * 2,
        filteredUsers: DEVELOPERS,
    },
    typing: true,
};
