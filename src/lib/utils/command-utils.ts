import { type ApplicationCommandRegistry, container } from "@sapphire/framework";
import { chatInputApplicationCommandMention } from "discord.js";

export function getCommandMention(commandName: string): string | `</${string}:${string}>` {
    const command: ApplicationCommandRegistry = container.applicationCommandRegistries.acquire(commandName);
    const commandId = command.globalChatInputCommandIds.values().next().value;

    if (!commandId) return `/${commandName}`;

    return chatInputApplicationCommandMention(command.commandName, commandId);
}
