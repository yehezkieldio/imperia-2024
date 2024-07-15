import { container } from "@sapphire/framework";
import { chatInputApplicationCommandMention } from "discord.js";

// based on the folder names of the commands
export const commandCategories = [
    {
        name: "Configuration",
        value: "configuration",
    },
    {
        name: "Entertainment",
        value: "entertainment",
    },
    {
        name: "Information",
        value: "information",
    },
    {
        name: "Miscellaneous",
        value: "miscellaneous",
    },
    {
        name: "Moderation",
        value: "moderation",
    },
    {
        name: "System",
        value: "system",
    },
];

export const getCommandMention = (commandName: string): string | `</${string}:${string}>` => {
    const command = container.applicationCommandRegistries.acquire(commandName);
    const commandId = command.globalChatInputCommandIds.values().next().value;

    if (!commandId) return `/${commandName}`;

    return chatInputApplicationCommandMention(command.commandName, commandId);
};
