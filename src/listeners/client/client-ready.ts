import { ImperiaEvents } from "@/lib/extensions/constants/events";
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

    public async run(client: Client): Promise<void> {
        this.container.datastore.connect();

        const { username, id } = client.user as ClientUser;

        const userCount: number = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const guildCount: number = client.guilds.cache.size;

        this.container.logger.info(`ClientReadyListener: Successfully logged in as ${username}. (${id})`);
        this.container.logger.info(`ClientReadyListener: Serving ${userCount} users in ${guildCount} guilds.`);
    }
}
