import type { Repositories, RepositoriesStore } from "@/lib/stores/repositories";
import type { Services, ServicesStore } from "@/lib/stores/services";
import type { Utilities } from "@/lib/stores/utilities/utilities";
import type { UtilitiesStore } from "@/lib/stores/utilities/utilities-store";
import type { CommandHistoryRepository } from "@/repositories/command-history";
import type { UserRepository } from "@/repositories/user";
import type { BlacklistService } from "@/services/blacklist";
import type { StringUtilities } from "@/utilities/string";
import type { Guild } from "discord.js";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";
export * as schema from "../databases/postgres/schema";

declare module "discord.js" {
    export interface Client {
        utilities: Utilities;
        services: Services;
        repos: Repositories;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        utilities: UtilitiesStore;
        services: ServicesStore;
        repos: RepositoriesStore;
    }

    interface Utilities {
        string: StringUtilities;
    }

    interface Services {
        blacklist: BlacklistService;
    }

    interface Repositories {
        user: UserRepository;
        history: CommandHistoryRepository;
    }

    interface Container {
        utilities: Utilities;
        services: Services;
        repos: Repositories;
        db: {
            dragonfly: Redis;
            postgres: PostgresJsDatabase<typeof schema>;
        };
    }
}

declare module "@sapphire/framework" {
    interface ArgType {
        imageFilter: string;
        guild: Guild;
    }

    interface StoreRegistryEntries {
        utilities: UtilitiesStore;
        services: ServicesStore;
        repos: RepositoriesStore;
    }

    interface Preconditions {
        DeveloperOnly: never;
    }
}
