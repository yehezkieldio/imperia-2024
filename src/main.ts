import { configuration } from "@/configuration";
import { ImperiaClient } from "@/core/extensions/client";
import { env } from "@/~environment";

import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "@sapphire/plugin-scheduled-tasks/register";

import "./core/stores/services/register";

const main: () => Promise<void> = async (): Promise<void> => {
    const client = new ImperiaClient(configuration);
    await client.login(env.DISCORD_TOKEN);

    process.on("SIGINT", async () => {
        await client.destroy();

        process.exit(1);
    });
};

void main();
