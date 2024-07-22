import { dragonfly as df } from "@/core/database/dragonfly/connection";
import { onDfConnectInitialize } from "@/core/database/dragonfly/startup-init";
import { connection, db } from "@/core/database/postgres/connection";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import type { ClientOptions } from "discord.js";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

/**
 * The client that the bot uses to interact with Discord.
 */
export class ImperiaClient extends SapphireClient {
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
        container.dragonfly = df;
        container.dragonfly.on("connect", async (): Promise<void> => await onDfConnectInitialize());
        container.dragonfly.on("error", (error): void => {
            container.logger.error("ImperiaClient: An error occurred with the Dragonfly data store.");
            container.logger.error(error);

            process.exit(1);
        });

        container.database = db;
        container.logger.info("ImperiaClient: Connected to the PostgresQL database.");
        try {
            container.logger.info("ImperiaClient: Testing the PostgresQL database connection.");
            await container.database.query.users.findFirst();
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
        container.dragonfly.disconnect();
        container.logger.info("ImperiaClient: Disconnected from the Dragonfly data store.");

        await connection.end({ timeout: 3 });
        container.logger.info("ImperiaClient: Disconnected from the PostgresQL database.");

        return super.destroy();
    }
}
