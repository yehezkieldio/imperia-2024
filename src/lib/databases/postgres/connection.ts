import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Cache the database connection in development.
 * This avoids creating a new connection on every HMR update.
 */
const globalForDb = globalThis as unknown as {
    connection: postgres.Sql | undefined;
};

export const connection: postgres.Sql = globalForDb.connection ?? postgres(Bun.env.DATABASE_URL);
if (Bun.env.NODE_ENV !== "production") globalForDb.connection = connection;

export const database: PostgresJsDatabase<typeof schema> = drizzle(connection, { schema });
