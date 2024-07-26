import { configuration } from "@/configuration";
import { envVariables } from "@/lib/env";
import { ImperiaClient } from "@/lib/extensions/client";

// Parse the environment variables and verify their existence and correctness.
envVariables.parse(process.env);

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-scheduled-tasks/register";

/**
 * The main entrypoint for the bot.
 */
export async function main(): Promise<void> {
    const client = new ImperiaClient(configuration);
    await client.login(Bun.env.DISCORD_TOKEN);

    process.on("SIGINT", async (): Promise<void> => {
        client.logger.info("Entrypoint: Received SIGINT, exiting...");

        await client.destroy().then((): never => {
            process.exit();
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
