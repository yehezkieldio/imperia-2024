import { dragonfly } from "@/core/database/dragonfly/connection";
import { createDfSearchIndexes } from "@/core/database/dragonfly/search-index";
import { db } from "@/core/database/postgres/connection";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import type { ClientOptions } from "discord.js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";

import type * as schema from "../database/postgres/schema";

/**
 * The options for the client, which extends the SapphireClientOptions and ClientOptions.
 */
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
        container.df = dragonfly;

        container.df.on("connect", async (): Promise<void> => {
            container.logger.info("ImperiaClient: Connected to the Dragonfly data store, caching is now available.");

            container.logger.info("ImperiaClient: Creating full-text search index for the data store.");
            await createDfSearchIndexes();
            container.logger.info("ImperiaClient: Full-text search index created.");
        });

        container.df.on("error", (error): void => {
            container.logger.error("ImperiaClient: An error occurred with the Dragonfly data store.");
            container.logger.error(error);

            process.exit(1);
        });

        container.db = db;

        try {
            await container.db.query.users.findFirst();
        } catch (error) {
            container.logger.error("ImperiaClient: An error occurred with the Postgres database.");
            container.logger.error(error);

            process.exit(1);
        }

        container.logger.info("ImperiaClient: Connected to the PostgresQL database.");

        return super.login(token);
    }
}

declare module "@sapphire/pieces" {
    interface Container {
        df: Redis;
        db: PostgresJsDatabase<typeof schema>;
    }
}
