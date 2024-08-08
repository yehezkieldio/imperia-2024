import { dragonflyClient } from "@/lib/databases/dragonfly/client";
import { Listener } from "@sapphire/framework";

export class DragonflyReadyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: "ready",
            emitter: dragonflyClient,
        });
    }

    public async run(): Promise<void> {
        this.container.logger.info("DragonflyReadyListener: Successfully connected to the Dragonfly data store.");
    }
}
