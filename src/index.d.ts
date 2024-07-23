import type { CommandHistoryRepository } from "@/utilities/history";
import type { Toolbox } from "@/utilities/toolbox";
import type { UserRepository } from "@/utilities/user-repository";

import type { ServicesStore } from "@core/stores/services/service-store";
import type { Services } from "@core/stores/services/services";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";
import type * as schema from "./core/database/postgres/schema";

declare module "discord.js" {
    export interface Client {
        services: Services;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        services: ServicesStore;
    }
    interface Container {
        dragonfly: Redis;
        database: PostgresJsDatabase<typeof schema>;
        services: Services;
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
