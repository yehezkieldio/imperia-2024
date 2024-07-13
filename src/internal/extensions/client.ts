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
                "ImperiaClient: Default behavior for application commands registries are set to BulkOverwrite.",
            );

            ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
        }
    }
}
