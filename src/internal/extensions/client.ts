import { dragonfly } from "@/internal/database/dragonfly/connection";
import { initIndexes } from "@/internal/database/dragonfly/indexes";
import { conn, db as database } from "@/internal/database/postgres/connection";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import { TimerManager } from "@sapphire/timer-manager";
import type { ClientOptions } from "discord.js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Redis } from "ioredis";
import type * as schema from "../database/postgres/schema";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

export class ImperiaClient extends SapphireClient {
    public constructor(options: ImperiaClientOptions) {
        super(options);

        if (options.overrideApplicationCommandsRegistries) {
            container.logger.info(
                "ImperiaClient: Default behavior for application commands registries are set to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override async login(token: string) {
        container.db = database;
        container.logger.info("ImperiaClient: Connected to PostgreSQL, database layer initialized.");

        container.df = dragonfly;
        container.logger.info("ImperiaClient: Connected to Dragonfly, cache layer and utilities initialized.");

        initIndexes();
        container.logger.info("ImperiaClient: Initialized all indexes for Dragonfly.");

        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        await conn.end({
            timeout: 5,
        });
        TimerManager.destroy();

        return super.destroy();
    }
}

declare module "@sapphire/pieces" {
    interface Container {
        db: PostgresJsDatabase<typeof schema>;
        df: Redis;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        RegisteredUserOnly: never;
        DeveloperOnly: never;
    }
}
