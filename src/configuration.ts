import { DEVELOPERS } from "@/core/constants";
import type { ImperiaClientOptions } from "@/core/extensions/client";
import { env } from "@/environment";
import { LogLevel, type CooldownOptions as SapphireCooldownOptions } from "@sapphire/framework";
import type { ScheduledTaskHandlerOptions } from "@sapphire/plugin-scheduled-tasks";
import { Time } from "@sapphire/time-utilities";
import { GatewayIntentBits, type MessageMentionOptions, Partials as PartialEnums } from "discord.js";

const Partials: Array<PartialEnums> = [PartialEnums.Message, PartialEnums.User, PartialEnums.GuildMember];

const Intents: Array<GatewayIntentBits> = [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
];

const AllowedMentions: MessageMentionOptions = {
    parse: [],
    users: [],
    roles: [],
    repliedUser: true,
};

const ScheduledTaskOptions: ScheduledTaskHandlerOptions = {
    queue: "{scheduled-tasks}",
    bull: {
        connection: {
            host: env.DRAGONFLY_HOST,
            port: env.DRAGONFLY_PORT,
            db: 4,
        },
    },
};

const CooldownOptions: SapphireCooldownOptions = {
    delay: Time.Second * 3,
    filteredUsers: DEVELOPERS,
};

/**
 * This is the overall configuration for the bot.
 */
export const configuration: ImperiaClientOptions = {
    allowedMentions: AllowedMentions,
    defaultCooldown: CooldownOptions,
    defaultPrefix: "ii.",
    intents: Intents,
    loadDefaultErrorListeners: env.NODE_ENV === "development",
    loadMessageCommandListeners: true,
    loadScheduledTaskErrorListeners: true,
    loadApplicationCommandRegistriesStatusListeners: true,
    logger: { level: env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info },
    overrideApplicationCommandsRegistries: true,
    partials: Partials,
    tasks: ScheduledTaskOptions,
    typing: true,
};
