import { ImperiaEvents } from "@/lib/extensions/events";
import { Listener, PluginHook } from "@sapphire/framework";

export class PiecePostLoadListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.PluginLoaded,
        });
    }

    public async run(hook: PluginHook, name: string): Promise<void> {
        if (hook === PluginHook.PostLogin) {
            // Run some post-login logic for the Reddit service on custom stores load.
            if (name === "Stores-PostLogin") {
                await this.container.services.reddit._postLoad();
            }
        }
    }
}
