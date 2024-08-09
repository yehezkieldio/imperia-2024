import {
    type PgTableFn,
    index,
    pgEnum,
    pgTable,
    pgTableCreator,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const createTable: PgTableFn = pgTableCreator((name) => `imperia_${name}`);

/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */

const blacklistTypeEnum = pgEnum("blacklist_type", ["user", "guild"]);
export type BlacklistType = (typeof blacklistTypeEnum.enumValues)[number];

export const blacklist = pgTable(
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

/* -------------------------------------------------------------------------- */

const commandResultTypeEnum = pgEnum("command_result_type", ["success", "error", "denied"]);
export type CommandResultType = (typeof commandResultTypeEnum.enumValues)[number];

export const analytics = pgTable(
    "analytics",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: varchar("user_id").notNull(),
        guildId: varchar("guild_id").notNull(),
        command: varchar("command").notNull(),
        result: commandResultTypeEnum("result").notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (analytics) => ({
        userIdIdx: index("analytics_user_id_idx").on(analytics.userId),
        guildIdIdx: index("analytics_guild_id_idx").on(analytics.guildId),
        commandIdx: index("analytics_command_idx").on(analytics.command),
        resultIdx: index("analytics_result_idx").on(analytics.result),
        createdAtIdx: index("analytics_created_at_idx").on(analytics.createdAt),
    }),
);
