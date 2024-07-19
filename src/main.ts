import "@sapphire/plugin-scheduled-tasks/register";
import { env } from "@/environment";
import { ImperiaClient } from "@/internal/extensions/client";
import "@sapphire/plugin-logger/register";
import { configuration } from "./configuration";

/**
 * The main entrypoint for the bot.
 */
const main = async (): Promise<void> => {
    void new ImperiaClient(configuration).login(env.DISCORD_TOKEN);
};

void main();
