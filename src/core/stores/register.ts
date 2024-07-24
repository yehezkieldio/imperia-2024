import { Repositories } from "@/core/stores/repositories/repositories";
import { Services } from "@/core/stores/services/services";
import { Utilities } from "@/core/stores/utilities/utilities";
import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";

export class StoresPlugin extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.utilities = new Utilities();
        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.services = new Services();
        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.repositories = new Repositories();

        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.stores.register(this.utilities.store);

        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.stores.register(this.services.store);

        // biome-ignore lint/complexity/noThisInStatic: Bypass
        this.stores.register(this.repositories.store);
    }

    static [postLogin](this: SapphireClient): void {
        // biome-ignore lint/complexity/noThisInStatic: Bypass
        const utilities = this.utilities.store;
        for (const [name, piece] of utilities.entries()) {
            // biome-ignore lint/complexity/noThisInStatic: Bypass
            this.utilities.exposePiece(name, piece);
        }

        // biome-ignore lint/complexity/noThisInStatic: Bypass
        const services = this.services.store;
        for (const [name, piece] of services.entries()) {
            // biome-ignore lint/complexity/noThisInStatic: Bypass
            this.services.exposePiece(name, piece);
        }

        // biome-ignore lint/complexity/noThisInStatic: Bypass
        const repositories = this.repositories.store;
        for (const [name, piece] of repositories.entries()) {
            // biome-ignore lint/complexity/noThisInStatic: <explanation>
            this.repositories.exposePiece(name, piece);
        }
    }
}

SapphireClient.plugins.registerPreInitializationHook(StoresPlugin[preInitialization], "Stores-PreInitialization");
SapphireClient.plugins.registerPostLoginHook(StoresPlugin[postLogin], "Stores-PostLogin");
