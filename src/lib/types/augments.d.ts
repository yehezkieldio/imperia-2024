import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";

export * as schema from "@/lib/databases/postgres/schema";

declare module "@sapphire/pieces" {
    interface Container {
        datastore: Redis;
        database: PostgresJsDatabase<typeof schema>;
    }
}
declare module "@sapphire/framework" {
    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
