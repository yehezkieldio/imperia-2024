import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";

export * as schema from "../databases/postgres/schema";

declare module "@sapphire/pieces" {
    interface Container {
        datastore: Redis;
        database: PostgresJsDatabase<typeof schema>;
    }
}
