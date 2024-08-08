import {
    type PgTableFn,
    pgEnum,
    pgTable,
    pgTableCreator,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const createTable: PgTableFn = pgTableCreator((name) => `imperia_${name}`);

export const users = pgTable(
    "user",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        discordId: varchar("discordId").notNull(),
    },
    (user) => ({
        discordIdUidx: uniqueIndex("user_discord_id_uidx").on(user.discordId),
    }),
);

export const commandStatus = pgEnum("command_history_status", ["success", "denied", "error", "unknown"]);
export const commandType = pgEnum("command_history_type", ["slash", "message"]);

export const commandHistory = pgTable("command_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("userId").notNull(),
    guildId: varchar("guildId").notNull(),
    commandName: varchar("commandName").notNull(),
    status: commandStatus("status").notNull(),
    type: commandType("type").notNull(),
    executedAt: timestamp("executedAt").defaultNow(),
});

export const blacklistType = pgEnum("blacklist_entity_type", ["user", "guild"]);

export const blacklistEntity = pgTable(
    "blacklist_entity",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        entityId: varchar("entityId").notNull(),
        entityType: blacklistType("entityType").notNull(),
    },
    (blacklistEntity) => ({
        entityIdTypeUidx: uniqueIndex("blacklist_entity_entity_id_type_uidx").on(
            blacklistEntity.entityId,
            blacklistEntity.entityType,
        ),
    }),
);
