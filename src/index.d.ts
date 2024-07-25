import type { CommandHistoryRepository } from "@/core/databases/postgres/repositories/command-history";
import type { UserRepository } from "@/core/databases/postgres/repositories/user";
import type { Repositories } from "@/core/stores/repositories/repositories";
import type { RepositoriesStore } from "@/core/stores/repositories/repositories-store";
import type { Services } from "@/core/stores/services/services";
import type { ServicesStore } from "@/core/stores/services/services-store";
import type { Utilities } from "@/core/stores/utilities/utilities";
import type { UtilitiesStore } from "@/core/stores/utilities/utilities-store";
import type { ApiService } from "@/services/api";
import type { WikipediaService } from "@/services/wikipedia";
import type { TextUtilities } from "@/utilities/text";
import type { ToolboxUtilities } from "@/utilities/toolbox";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";
import type * as schema from "./core/databases/postgres/schema";

declare module "discord.js" {
    export interface Client {
        utilities: Utilities;
        services: Services;
        repositories: Repositories;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        utilities: UtilitiesStore;
        services: ServicesStore;
        repositories: RepositoriesStore;
    }

    interface Utilities {
        toolbox: ToolboxUtilities;
        text: TextUtilities;
    }

    interface Services {
        wikipedia: WikipediaService;
        api: ApiService;
    }

    interface Repositories {
        user: UserRepository;
        commandHistory: CommandHistoryRepository;
    }

    interface Container {
        database: {
            postgres: PostgresJsDatabase<typeof schema>;
            dragonfly: Redis;
        };
        repositories: Repositories;
        utilities: Utilities;
        services: Services;
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        imageFilter: string;
    }

    interface StoreRegistryEntries {
        utilities: UtilitiesStore;
        services: ServicesStore;
        repositories: RepositoriesStore;
    }
}

export default undefined;
