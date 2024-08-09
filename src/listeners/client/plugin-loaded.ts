import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { Listener, PluginHook } from "@sapphire/framework";

export class PluginLoadedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.PluginLoaded,
        });
    }

    public async run(hook: PluginHook, name: string): Promise<void> {
        if (hook === PluginHook.PostLogin) {
            if (name === "Stores-PostLogin") {
                this.container.logger.info("PluginLoadedListener: Custom stores successfully loaded.");
            }
        }
    }
}
