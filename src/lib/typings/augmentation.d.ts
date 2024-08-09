import type { Repositories } from "@/lib/stores/repository/repositories";
import type { RepositoriesStore } from "@/lib/stores/repository/repositories-store";
import type { Services, ServicesStore } from "@/lib/stores/service";
import type { Utilities, UtilitiesStore } from "@/lib/stores/utility";
import type { AnalyticsRepository } from "@/repositories/analytics";
import type { GuildsRepository } from "@/repositories/guilds";
import type { UsersRepository } from "@/repositories/users";

declare module "discord.js" {
    export interface Client {
        repos: Repositories;
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        repos: RepositoriesStore;
        services: ServicesStore;
        utilities: UtilitiesStore;
    }

    interface Repositories {
        analytics: AnalyticsRepository;
        users: UsersRepository;
        guilds: GuildsRepository;
    }

    interface Container {
        repos: Repositories;
    }
}

declare module "@sapphire/framework" {
    interface StoreRegistryEntries {
        repos: RepositoriesStore;
        services: ServicesStore;
        utilities: UtilitiesStore;
    }
}
