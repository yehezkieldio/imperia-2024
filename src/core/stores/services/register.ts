import { Services } from "@core/stores/services/services";
import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";

// biome-ignore lint/complexity/noStaticOnlyClass: Bypass the rule because this class is a plugin
export class ServicesPlugin extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        // biome-ignore lint/complexity/noThisInStatic: No easy way to avoid using `this` in this case
        this.services = new Services();
        // biome-ignore lint/complexity/noThisInStatic: Refer to the previous comment
        this.stores.register(this.services.store);
    }

    public static [postLogin](this: SapphireClient): void {
        // biome-ignore lint/complexity/noThisInStatic: Refer to the previous comment
        const pieces = this.services.store;

        for (const [name, piece] of pieces.entries()) {
            // biome-ignore lint/complexity/noThisInStatic: Refer to the previous comment
            this.services.exposePiece(name, piece);
        }
    }
}

SapphireClient.plugins.registerPreInitializationHook(
    ServicesPlugin[preInitialization],
    "ServicesStore-PreInitialization",
);
SapphireClient.plugins.registerPostLoginHook(ServicesPlugin[postLogin], "UtilitiesStore-PostLogin");
