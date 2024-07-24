import { Repositories } from "@/core/stores/repositories/repositories";
import { Services } from "@/core/stores/services/services";
import { Utilities } from "@/core/stores/utilities/utilities";
import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";

export class StoresPlugin extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        this.utilities = new Utilities();
        this.services = new Services();
        this.repositories = new Repositories();

        this.stores.register(this.utilities.store);
        this.stores.register(this.services.store);
        this.stores.register(this.repositories.store);
    }

    static [postLogin](this: SapphireClient): void {
        const utilities = this.utilities.store;
        for (const [name, piece] of utilities.entries()) {
            this.utilities.exposePiece(name, piece);
        }

        const services = this.services.store;
        for (const [name, piece] of services.entries()) {
            this.services.exposePiece(name, piece);
        }

        const repositories = this.repositories.store;
        for (const [name, piece] of repositories.entries()) {
            this.repositories.exposePiece(name, piece);
        }
    }
}

SapphireClient.plugins.registerPreInitializationHook(StoresPlugin[preInitialization], "Stores-PreInitialization");
SapphireClient.plugins.registerPostLoginHook(StoresPlugin[postLogin], "Stores-PostLogin");
