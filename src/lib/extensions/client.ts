import { dragonflyClient } from "@/lib/databases/dragonfly/client";
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

        if (options.overrideApplicationCommandsRegistries) {
            container.logger.info(
                "ImperiaClient: Overriding the default behavior for application commands registries to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }

    public override async login(token: string): Promise<string> {
        container.dragonfly = dragonflyClient;

        return super.login(token);
    }
}
