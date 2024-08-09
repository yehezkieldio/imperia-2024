import { envVariables } from "@/lib/env";

// Parse the environment variables and verify their existence and correctness.
envVariables.parse(process.env);

import { configuration } from "@/config";
import { ImperiaClient } from "@/lib/extensions/client";

// Load plugin(s) and register them.
import "@sapphire/plugin-logger/register";

/**
 * The main entrypoint for the bot.
 */
export async function main(): Promise<void> {
    const client = new ImperiaClient(configuration);
    await client.login(Bun.env.DISCORD_TOKEN);

    process.on("SIGINT", async (): Promise<void> => {
        await client.destroy().then((): never => {
            process.exit();
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
