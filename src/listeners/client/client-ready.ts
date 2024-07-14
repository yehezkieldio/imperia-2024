import { ImperiaEvents } from "@/internal/types/events";
import { Listener } from "@sapphire/framework";
import type { Client, ClientUser } from "discord.js";

export class ClientReadyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: ImperiaEvents.ClientReady,
        });
    }

    public async run(client: Client) {
        const { username, id } = client.user as ClientUser;

        this.container.logger.info(`ReadyListener: Successfully logged in as ${username} (${id})`);
    }
}
