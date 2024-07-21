import { configuration } from "@/configuration";
import { ImperiaClient } from "@/core/extensions/client";
import { env } from "@/~environment";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "@sapphire/plugin-scheduled-tasks/register";

const main: () => Promise<void> = async (): Promise<void> => {
    void new ImperiaClient(configuration).login(env.DISCORD_TOKEN);
};

void main();
