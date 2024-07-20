import { cuid2 } from "drizzle-cuid2/postgres";
import { type PgTableFn, boolean, pgTable, pgTableCreator, uniqueIndex, varchar } from "drizzle-orm/pg-core";

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
