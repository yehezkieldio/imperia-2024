import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import type { UserError } from "@sapphire/framework";
import { Utility } from "@sapphire/plugin-utilities-store";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import { ChannelType, chatInputApplicationCommandMention, inlineCode } from "discord.js";

export class Toolbox extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "toolbox",
        });
    }

    public generateCommandDeniedEmbed(error: UserError) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isWarningEmbed();

        embed.setFooter({
            text: `Error Identifier: ${capitalizeFirstLetter(error.identifier)}`,
        });

        switch (error.identifier) {
            // General command errors
            case ImperiaIdentifiers.CommandDisabled:
                embed.setDescription("This command is currently disabled!");
                break;
            case ImperiaIdentifiers.PreconditionCooldown:
                embed.setTitle("This command is on cooldown!");
                embed.setDescription("Please wait for the cooldown to expire.");
                break;
            case ImperiaIdentifiers.PreconditionRunIn:
                embed.setTitle("This command is not available in this context!");
                embed.setDescription(`Please use this command in a ${this.getChannelType(error)}`);
                break;

            // Permission errors
            case ImperiaIdentifiers.PreconditionClientPermissions ||
                ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions:
                embed.setTitle("I am missing required permissions to execute this command!");
                embed.setDescription(`Required permission(s): ${this.getMissingPermissions(error)}`);
                break;
            case ImperiaIdentifiers.PreconditionUserPermissions ||
                ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions:
                embed.setTitle("You are missing required permissions to execute this command!");
                embed.setDescription(`Required permission(s): ${this.getMissingPermissions(error)}`);
                break;
            default:
                embed.setDescription("Unhandled error occurred while executing this command!");
                break;
        }

        return embed;
    }

    public getChannelType(error: UserError) {
        const channelType = Reflect.get(Object(error.context), "types") as number[];

        if (channelType.includes(ChannelType.GuildText)) return "server text channel.";
        if (channelType.includes(ChannelType.DM)) return "DM channel.";
        return "valid channel.";
    }

    public getMissingPermissions(error: UserError) {
        const missing = Reflect.get(Object(error.context), "missing") as string[];

        return missing.map((perm) => inlineCode(perm)).join(" ");
    }

    public getCommandMention = (commandName: string): string | `</${string}:${string}>` => {
        const command = this.container.applicationCommandRegistries.acquire(commandName);
        const commandId = command.globalChatInputCommandIds.values().next().value;

        if (!commandId) return `/${commandName}`;

        return chatInputApplicationCommandMention(command.commandName, commandId);
    };

    public async isValidUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: "HEAD" }, FetchResultTypes.Result);
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

    public slugifyKey = (str: string) => str.toLowerCase().replace(/\s+/g, "_");
}
