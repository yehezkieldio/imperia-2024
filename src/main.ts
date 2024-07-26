// Parse the environment variables and verify their existence and correctness.
import { envVariables } from "@/lib/env";
envVariables.parse(process.env);

import { configuration } from "@/configuration";
import { ImperiaClient } from "@/lib/extensions/client";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-scheduled-tasks/register";

// Register custom stores, such as the utilities, the services, etc.
import "./lib/stores/register";

/**
 * The main entrypoint for the bot.
 */
export async function main(): Promise<void> {
    const client = new ImperiaClient(configuration);
    await client.login(Bun.env.DISCORD_TOKEN);

    process.on("SIGINT", async (): Promise<void> => {
        client.logger.info("EntrypointMain: Received SIGINT, exiting...");

        await client.destroy().then((): never => {
            process.exit();
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
