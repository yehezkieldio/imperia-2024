import { ImperiaListener } from "@/core/extensions/listener";
import { ImperiaEvents } from "@/core/types/events";
import type { Client, ClientUser } from "discord.js";

export class ClientReadyListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: true,
            event: ImperiaEvents.ClientReady,
        });
    }

    public async run(client: Client): Promise<void> {
        const { username, id } = client.user as ClientUser;
        const userCount: number = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const guildCount: number = client.guilds.cache.size;

        this.container.logger.info(`ClientReadyListener: Successfully logged in as ${username}. (${id})`);
        this.container.logger.info(`ClientReadyListener: Serving ${userCount} users in ${guildCount} guilds.`);
    }
}
