import { ImperiaEvents } from "@/lib/extensions/events";
import { Listener, type PluginHook } from "@sapphire/framework";

export class PiecePostLoadListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.PluginLoaded,
        });
    }

    public async run(hook: PluginHook, name: string): Promise<void> {
        if (name === "Stores-PostLogin") {
            await this.container.services.reddit.postLoadSetup();
        }
    }
}
