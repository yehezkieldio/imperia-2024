import { join } from "node:path";
import { dragonflyClient } from "@/lib/databases/dragonfly/client";
import {
    ApplicationCommandRegistries,
    RegisterBehavior,
    SapphireClient,
    type SapphireClientOptions,
    container,
} from "@sapphire/framework";
import { type RootData, getRootData } from "@sapphire/pieces";
import type { ClientOptions } from "discord.js";
import type { Redis } from "ioredis";

export interface ImperiaClientOptions extends SapphireClientOptions, ClientOptions {
    overrideApplicationCommandsRegistries?: boolean;
}

export class ImperiaClient extends SapphireClient {
    private rootData: RootData = getRootData();

    public constructor(options: ImperiaClientOptions) {
        super(options);

        container.logger.info(`ImperiaClient: Running on a ${Bun.env.NODE_ENV} environment.`);

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
        container.datastore = dragonflyClient;

        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        return super.destroy();
    }
}

declare module "@sapphire/pieces" {
    interface Container {
        datastore: Redis;
    }
}
