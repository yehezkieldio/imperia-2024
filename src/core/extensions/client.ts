import { join } from "node:path";
import { dragonfly as df } from "@/core/databases/dragonfly/connection";
import { onDfConnectInitialize } from "@/core/databases/dragonfly/startup-init";
import { connection, db } from "@/core/databases/postgres/connection";
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

/**
 * The client that the bot uses to interact with Discord.
 */
export class ImperiaClient extends SapphireClient {
    private rootData: RootData = getRootData();

    public constructor(options: ImperiaClientOptions) {
        super(options);

        if (options.overrideApplicationCommandsRegistries) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override async login(token: string): Promise<string> {
        const repositoriesPath: string = join(this.rootData.root, "core", "databases", "postgres", "repositories");
        container.stores.get("repositories").registerPath(repositoriesPath);

        container.database = {
            postgres: db,
            dragonfly: df,
        };

        // container.database.dragonfly = df;
        container.database.dragonfly.on("connect", async (): Promise<void> => await onDfConnectInitialize());
        container.database.dragonfly.on("error", (error): void => {
            container.logger.error("ImperiaClient: An error occurred with the Dragonfly data store.");
            container.logger.error(error);

            process.exit(1);
        });

        // container.database.postgres = db;
        container.logger.info("ImperiaClient: Connected to the PostgresQL database.");
        try {
            container.logger.info("ImperiaClient: Testing the PostgresQL database connection.");
            await container.database.postgres.query.users.findFirst();
            container.logger.info("ImperiaClient: PostgresQL database connection test successful.");
        } catch (error) {
            container.logger.error("ImperiaClient: An error occurred with the Postgres database.");
            container.logger.error(error);

            process.exit(1);
        }
        container.logger.info("ImperiaClient: PostgresQL database is ready for use.");

        return super.login(token);
    }

    public override async destroy() {
        container.database.dragonfly.disconnect();
        container.logger.info("ImperiaClient: Disconnected from the Dragonfly data store.");

        await connection.end({ timeout: 3 });
        container.logger.info("ImperiaClient: Disconnected from the PostgresQL database.");

        return super.destroy();
    }
}
