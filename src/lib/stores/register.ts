import { Repositories } from "@/lib/stores/repositories";
import { Services } from "@/lib/stores/services";
import { Utilities } from "@/lib/stores/utilities";
import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";

function exposeStorePieces<T>(store: Map<string, T>, exposePiece: (name: string, piece: T) => void): void {
    for (const [name, piece] of store.entries()) {
        exposePiece(name, piece);
    }
}

export class Stores extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        this.utilities = new Utilities();
        this.stores.register(this.utilities.store);

        this.services = new Services();
        this.stores.register(this.services.store);

        this.repos = new Repositories();
        this.stores.register(this.repos.store);
    }

    public static [postLogin](this: SapphireClient): void {
        exposeStorePieces(this.utilities.store, this.utilities.exposePiece.bind(this.utilities));
        exposeStorePieces(this.services.store, this.services.exposePiece.bind(this.services));
        exposeStorePieces(this.repos.store, this.repos.exposePiece.bind(this.repos));
    }
}

SapphireClient.plugins.registerPostInitializationHook(Stores[preInitialization], "Stores-PreInitialization");
SapphireClient.plugins.registerPostLoginHook(Stores[postLogin], "Stores-PostLogin");
