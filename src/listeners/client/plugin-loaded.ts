import { ImperiaEvents } from "@/lib/extensions/events";
import { Listener } from "@sapphire/framework";

export class PiecePostLoadListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.PluginLoaded,
        });
    }

    public async run(hook: string, name: string): Promise<void> {
        if (name === "Stores-PostLogin") {
            await this.container.services.reddit.postLoadSetup();
        }
    }
}
