import { cuid2 } from "drizzle-cuid2/postgres";
import { boolean, index, pgEnum, pgTable, pgTableCreator, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM.
 * Use the same database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `aletheia_${name}`);

export const users = pgTable(
    "user",
    {
        id: cuid2("id").defaultRandom().primaryKey(),
        discordId: varchar("discordId").notNull(),
        /**
         * An option should Imperia reply ephermally to a user's command.
         */
        responsePrivacy: boolean("responsePrivacy").default(false),
    },
    (user) => ({
        usernameUidx: uniqueIndex("user_username_uidx").on(user.discordId),
    }),
);

export const commandUsageStatus = pgEnum("command_usage_status", ["success", "denied", "error"]);

export const commandUsage = pgTable(
    "command_usage",
    {
        id: cuid2("id").defaultRandom().primaryKey(),
        /**
         * The Discord user ID of the user who used the command.
         */
        discordId: varchar("userId").notNull(),
        guildId: varchar("guildId").notNull(),
        command: varchar("command").notNull(),
        timestamp: timestamp("timestamp").notNull(),
        status: commandUsageStatus("status").notNull(),
    },
    (table) => {
        return {
            discordIdIdx: index("command_usage_discord_id_idx").on(table.discordId),
            guildIdIdx: index("command_usage_guild_id_idx").on(table.guildId),
            commandIdx: index("command_usage_command_idx").on(table.command),
            timestampIdx: index("command_usage_timestamp_idx").on(table.timestamp),
        };
    },
);
