import { users } from "@/internal/database/postgres/schema";
import { type Container, container as c } from "@sapphire/framework";
import { chatInputApplicationCommandMention } from "discord.js";

export class CommandUtils {
    private container: Container = c;

    public static commandCategories = [
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

    public async responsePrivacy(userId: string): Promise<boolean> {
        const [user] = await this.container.db.select().from(users);
        if (!user) return false;

        return Boolean(user.responsePrivacy);
    }

    public async isValidUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: "HEAD" });
            return response.ok;
        } catch (error) {
            this.container.logger.error(`Error validating URL ${url}:`, error);
            return false;
        }
    }

    public randomizeArray<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    public trimString = (str: string, length: number) => {
        return str.length > length ? `${str.substring(0, length)}...` : str;
    };

    public stripHtmlTags = (str: string) => str.replace(/<[^>]*>?/gm, "").replace(/<br\/?>/gm, "\n");

    public getCommandMention = (commandName: string): string | `</${string}:${string}>` => {
        const command = this.container.applicationCommandRegistries.acquire(commandName);
        const commandId = command.globalChatInputCommandIds.values().next().value;

        if (!commandId) return `/${commandName}`;

        return chatInputApplicationCommandMention(command.commandName, commandId);
    };
}
