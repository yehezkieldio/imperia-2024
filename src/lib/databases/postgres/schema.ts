import {
    type PgTableFn,
    index,
    pgEnum,
    pgTable,
    pgTableCreator,
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
