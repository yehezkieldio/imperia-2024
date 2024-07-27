import { join } from "node:path";
import { dragonflyClient } from "@/lib/databases/dragonfly/client";
import { onDragonFlyReadySetup } from "@/lib/databases/dragonfly/on-ready-setup";
import { connection, database } from "@/lib/databases/postgres/connection";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import { type RootData, getRootData } from "@sapphire/pieces";
import type { ClientOptions } from "discord.js";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

export class ImperiaClient extends SapphireClient {
    private rootData: RootData = getRootData();

    public constructor(options: ImperiaClientOptions) {
        super(options);

        if (options.overrideApplicationCommandsRegistries === true) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }

        const repositoryStore = container.stores.get("repos");
        repositoryStore.registerPath(join(this.rootData.root, "repositories"));
    }

    public override async login(token: string): Promise<string> {
        container.db = {
            dragonfly: dragonflyClient,
            postgres: database,
        };

        // Listen for events from the Dragonfly
        container.db.dragonfly.on("connect", async (): Promise<void> => await onDragonFlyReadySetup());
        container.db.dragonfly.on("error", (error: Error): void => {
            container.logger.error("ImperiaClient: An error occurred with the Dragonfly data store, see below:");
            container.logger.error(error);
            process.exit(1);
        });

        // Verify if there is a connection and the tables are created in the database
        container.logger.info("ImperiaClient: Connected to the PostgreSQL database.");
        try {
            container.logger.info("ImperiaClient: Testing the PostgresQL database connection...");
            await container.db.postgres.query.users.findFirst();
            container.logger.info("ImperiaClient: PostgresQL database connection test successful.");
        } catch (error) {
            container.logger.error("ImperiaClient: An error occurred with the Postgres database, see below:");
            container.logger.error(error);

            process.exit(1);
        }
        container.logger.info("ImperiaClient: PostgresQL database is ready for use.");

        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        await connection.end({ timeout: 3 });
        container.logger.info("ImperiaClient: Disconnected from the PostgresQL database.");

        await container.tasks.client.pause();
        container.logger.info("ImperiaClient: Paused the scheduled tasks.");

        container.db.dragonfly.disconnect();
        container.logger.info("ImperiaClient: Disconnected from the Dragonfly data store.");

        return super.destroy();
    }
}
