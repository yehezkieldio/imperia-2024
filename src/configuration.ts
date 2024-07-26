import { DEVELOPERS } from "@/lib/const";
import type { ImperiaClientOptions } from "@/lib/extensions/client";
import { LogLevel, type CooldownOptions as SapphireCooldownOptions } from "@sapphire/framework";
import type { ScheduledTaskHandlerOptions } from "@sapphire/plugin-scheduled-tasks";
import { Time } from "@sapphire/time-utilities";
import { ActivityType, GatewayIntentBits, type MessageMentionOptions, Partials as PartialEnums } from "discord.js";

const partials: Array<PartialEnums> = [PartialEnums.Message, PartialEnums.User, PartialEnums.GuildMember];

const intents: Array<GatewayIntentBits> = [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
];

const allowedMentions: MessageMentionOptions = {
    parse: [],
    users: [],
    roles: [],
    repliedUser: true,
};

const scheduledTaskOptions: ScheduledTaskHandlerOptions = {
    queue: "{scheduled-tasks}",
    bull: {
        connection: {
            host: Bun.env.DRAGONFLY_HOST,
            port: Bun.env.DRAGONFLY_PORT,
            db: 4,
        },
    },
};

const cooldownOptions: SapphireCooldownOptions = {
    delay: Time.Second * 3,
    filteredUsers: DEVELOPERS,
};

export const configuration: ImperiaClientOptions = {
    allowedMentions: allowedMentions,
    defaultCooldown: cooldownOptions,
    defaultPrefix: "imperia ",
    intents: intents,
    loadApplicationCommandRegistriesStatusListeners: true,
    loadDefaultErrorListeners: Bun.env.NODE_ENV === "development",
    loadMessageCommandListeners: true,
    loadScheduledTaskErrorListeners: true,
    logger: { level: Bun.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info },
    overrideApplicationCommandsRegistries: true,
    partials: partials,
    presence: { activities: [{ type: ActivityType.Listening, name: "reality, the manifested. ✨" }], status: "dnd" },
    tasks: scheduledTaskOptions,
    typing: true,
};
