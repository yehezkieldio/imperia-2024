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
}

export class ImperiaClient extends SapphireClient {
    public constructor(options: ImperiaClientOptions) {
        super(options);

        container.logger.info(`ImperiaClient: Running a ${Bun.env.NODE_ENV} environment!`);

        if (options.overrideApplicationCommandsRegistries) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override async login(token: string): Promise<string> {
        container.datastore = dragonflyClient;
        container.database = database;
        container.client = this;

        return super.login(token);
    }
}
