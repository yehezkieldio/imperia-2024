import { cuid2 } from "drizzle-cuid2/postgres";
import {
    type PgTableFn,
    boolean,
    pgEnum,
    pgTable,
    pgTableCreator,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const createTable: PgTableFn = pgTableCreator((name) => `aletheia_${name}`);

export const users = pgTable(
    "user",
    {
        id: cuid2("id").defaultRandom().primaryKey(),
        discordId: varchar("discordId").notNull(),
        /**
         * The response privacy for slash commands, either true for ephemeral or false for normal.
         */
        responsePrivacy: boolean("responsePrivacy").default(false),
    },
    (user) => ({
        discordIdUidx: uniqueIndex("user_discord_id_uidx").on(user.discordId),
    }),
);

const commandStatus = pgEnum("command_history_status", ["success", "denied", "error", "unknown"]);
export const commandStatusSchema = z.enum(commandStatus.enumValues);

export const commandHistory = pgTable("command_history", {
    id: cuid2("id").defaultRandom().primaryKey(),
    userId: varchar("userId").notNull(),
    guildId: varchar("guildId").notNull(),
    commandName: varchar("commandName").notNull(),
    status: commandStatus("status").notNull(),
    executedAt: timestamp("executedAt").defaultNow(),
});
