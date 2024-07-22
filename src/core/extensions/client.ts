import { dragonfly as df } from "@/core/database/dragonfly/connection";
import { loadEmoji } from "@/core/database/dragonfly/emoji/load-emoji";
import { createDfSearchIndexes } from "@/core/database/dragonfly/search-index";
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

        container.dragonfly.on("connect", async (): Promise<void> => {
            container.logger.info("ImperiaClient: Connected to the Dragonfly data store, caching is now available.");

            container.logger.info("ImperiaClient: Creating full-text search index for the data store.");
            await createDfSearchIndexes();
            container.logger.info("ImperiaClient: Full-text search index created.");

            container.logger.info("ImperiaClient: Loading emoji data into the data store.");
            const load: boolean = await loadEmoji();

            if (load) container.logger.info("ImperiaClient: Emoji data loaded.");
            else container.logger.info("ImperiaClient: Emoji data already exists in the data store, skipping load.");

            container.logger.info("ImperiaClient: Dragonfly data store is ready for use.");
        });

        container.dragonfly.on("error", (error): void => {
            container.logger.error("ImperiaClient: An error occurred with the Dragonfly data store.");
            container.logger.error(error);

            process.exit(1);
        });

        container.database = db;

        try {
            await container.database.query.users.findFirst();
        } catch (error) {
            container.logger.error("ImperiaClient: An error occurred with the Postgres database.");
            container.logger.error(error);

            process.exit(1);
        }

        container.logger.info("ImperiaClient: Connected to the PostgresQL database.");

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
