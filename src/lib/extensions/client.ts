import { dragonflyClient } from "@/lib/databases/dragonfly/client";
import { database } from "@/lib/databases/postgres/connection";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import type { ClientOptions } from "discord.js";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    /**
     * Whether to override the default behavior for application commands registries.
     */
    overrideApplicationCommandsRegistries?: boolean;

    /**
     * The Discord user IDs of the developers.
     */
    developerIds: string[];
}

export class ImperiaClient extends SapphireClient {
    public developerIds: string[];

    public constructor(options: ImperiaClientOptions) {
        super(options);

        if (options.overrideApplicationCommandsRegistries) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }

        this.developerIds = options.developerIds;
    }

    public override async login(token: string): Promise<string> {
        container.datastore = dragonflyClient;
        container.database = database;

        return super.login(token);
    }
}
