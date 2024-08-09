import type { Repositories } from "@/lib/stores/repository/repositories";
import type { RepositoriesStore } from "@/lib/stores/repository/repositories-store";
import type { Services, ServicesStore } from "@/lib/stores/service";
import type { Utilities, UtilitiesStore } from "@/lib/stores/utility";
import type { AnalyticsRepository } from "@/repositories/analytics";
import type { GuildsRepository } from "@/repositories/guilds";
import type { UsersRepository } from "@/repositories/users";
import type { AnalyticsService } from "@/services/analytics";
import type { ResponseService } from "@/services/response";
import type { BotUtilities } from "@/utilities/bot";

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

    interface Services {
        analytics: AnalyticsService;
        response: ResponseService;
    }

    interface Utilities {
        bot: BotUtilities;
    }

    interface Container {
        repos: Repositories;
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/framework" {
    interface StoreRegistryEntries {
        repos: RepositoriesStore;
        services: ServicesStore;
        utilities: UtilitiesStore;
    }

    interface Preconditions {
        DeveloperUserOnly: never;
    }
}
