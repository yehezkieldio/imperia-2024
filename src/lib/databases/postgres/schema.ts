import { sql } from "drizzle-orm";
import {
    type PgTableFn,
    index,
    pgEnum,
    pgTable,
    pgTableCreator,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const createTable: PgTableFn = pgTableCreator((name: string): string => `imperia_${name}`);

/* ---------------------------------- USER ---------------------------------- */

export const users = pgTable(
    "user",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        discordId: varchar("discord_id").notNull(),
    },
    (user) => ({
        discordIdUidx: uniqueIndex("user_discord_id_uidx").on(user.discordId),
    }),
);

/* ---------------------------------- GUILD --------------------------------- */

export const guilds = pgTable(
    "guild",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        discordId: varchar("discord_id").notNull(),
        commandsDisabled: text("commands_disabled").array().notNull().default(sql`'{}'::text[]`),
    },
    (guild) => ({
        discordIdUidx: uniqueIndex("guild_discord_id_uidx").on(guild.discordId),
    }),
);

/* -------------------------------- BLACKLIST ------------------------------- */

export const blacklistTypeEnum = pgEnum("blacklist_type", ["user", "guild"]);
export type BlacklistType = (typeof blacklistTypeEnum.enumValues)[number];

export const blacklists = pgTable(
    "blacklist",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        blacklistId: varchar("blacklist_id").notNull(),
        blacklistType: blacklistTypeEnum("blacklist_type").notNull(),
    },
    (blacklist) => ({
        blacklistIdUidx: uniqueIndex("blacklist_blacklist_id_uidx").on(blacklist.blacklistId),
        blacklistTypeEnumIdx: index("blacklist_blacklist_type_enum_idx").on(blacklist.blacklistType),
    }),
);

/* ---------------------------- COMMAND ANALYTIC ---------------------------- */

export const commandTypeEnum = pgEnum("command_type", ["chatinput", "message"]);
export type CommandType = (typeof commandTypeEnum.enumValues)[number];

export const commandResultTypeEnum = pgEnum("command_result_type", ["success", "error", "denied"]);
export type CommandResultType = (typeof commandResultTypeEnum.enumValues)[number];

export const commandAnalytics = pgTable(
    "command_analytic",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: varchar("user_id").notNull(),
        guildId: varchar("guild_id").notNull(),
        command: varchar("command").notNull(),
        result: commandResultTypeEnum("result").notNull(),
        type: commandTypeEnum("type").notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (commandAnalytics) => ({
        userIdIdx: index("command_analytic_user_id_idx").on(commandAnalytics.userId),
        guildIdIdx: index("command_analytic_guild_id_idx").on(commandAnalytics.guildId),
        commandIdx: index("command_analytic_command_idx").on(commandAnalytics.command),
        resultIdx: index("command_analytic_result_idx").on(commandAnalytics.result),
        createdAtIdx: index("command_analytic_created_at_idx").on(commandAnalytics.createdAt),
    }),
);
