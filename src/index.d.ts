import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";

import type { CommandHistoryRepository } from "@/core/databases/postgres/repositories/command-history";
import type { UserRepository } from "@/core/databases/postgres/repositories/user";
import type { RepositoriesStore } from "@/core/stores/repositories/repositories-store";
import type { ServicesStore } from "@/core/stores/services/services-store";
import type { UtilitiesStore } from "@/core/stores/utilities/utilities-store";

import type { ApiService } from "@/services/api";
import type { ToolboxUtilities } from "@/utilities/toolbox";
import type * as schema from "./core/databases/postgres/schema";

interface Services {
    api: ApiService;
}

interface Repositories {
    user: UserRepository;
    commandHistory: CommandHistoryRepository;
}

interface Utilities {
    toolbox: ToolboxUtilities;
}

declare module "@sapphire/pieces" {
    interface Container {
        database: {
            postgres: PostgresJsDatabase<typeof schema>;
            dragonfly: Redis;
        };
        services: Services;
        repositories: Repositories;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface StoreRegistryEntries {
        services: ServicesStore;
        repositories: RepositoriesStore;
        utilities: UtilitiesStore;
    }

    interface ArgType {
        imageFilter: string;
    }
}

export default undefined;
