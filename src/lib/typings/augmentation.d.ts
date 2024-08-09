import type { Repositories } from "@/lib/stores/repository/repositories";
import type { RepositoriesStore } from "@/lib/stores/repository/repositories-store";
import type { Services, ServicesStore } from "@/lib/stores/service";
import type { Utilities, UtilitiesStore } from "@/lib/stores/utility";

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
}

declare module "@sapphire/framework" {
    interface StoreRegistryEntries {
        repos: RepositoriesStore;
        services: ServicesStore;
        utilities: UtilitiesStore;
    }
}
