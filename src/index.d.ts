import type { CommandHistoryRepository } from "@/utilities/history";
import type { Toolbox } from "@/utilities/toolbox";
import type { UserRepository } from "@/utilities/user-repository";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";
import type * as schema from "./core/database/postgres/schema";

declare module "@sapphire/pieces" {
    interface Container {
        dragonfly: Redis;
        database: PostgresJsDatabase<typeof schema>;
    }
}

declare module "@sapphire/plugin-utilities-store" {
    export interface Utilities {
        userRepo: UserRepository;
        historyRepo: CommandHistoryRepository;
        toolbox: Toolbox;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        imageFilter: string;
    }
}

export default undefined;
