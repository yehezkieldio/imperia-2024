import { dragonfly } from "@/internal/database/dragonfly/connection";
import { conn, db as database } from "@/internal/database/postgres/connection";
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
        container.logger.info("ImperiaClient: Connected to PostgreSQL.");

        container.df = dragonfly;
        container.logger.info("ImperiaClient: Connected to Dragonfly.");

        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        await conn.end({
            timeout: 5,
        });

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
