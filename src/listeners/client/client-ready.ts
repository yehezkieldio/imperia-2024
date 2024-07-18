import { ImperiaEvents } from "@/internal/extensions/events";
import { ImperiaListener } from "@/internal/extensions/listener";
import type { Client, ClientUser } from "discord.js";

export class ClientReadyListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
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
