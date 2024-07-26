import { dragonflyClient } from "@/lib/databases/dragonfly/client";
import { onDragonFlyReadySetup } from "@/lib/databases/dragonfly/on-ready-setup";
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

export class ImperiaClient extends SapphireClient {
    public constructor(options: ImperiaClientOptions) {
        super(options);

        if (options.overrideApplicationCommandsRegistries === true) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }

        container.db = {
            dragonfly: dragonflyClient,
        };

        container.db.dragonfly.on("connect", async (): Promise<void> => await onDragonFlyReadySetup());
    }

    public override async login(token: string): Promise<string> {
        return super.login(token);
    }

    public override async destroy(): Promise<void> {
        return super.destroy();
    }
}
