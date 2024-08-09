import { Utility } from "@/lib/stores/utility";
import { FetchResultTypes, QueryError, fetch } from "@sapphire/fetch";
import type { UserError } from "@sapphire/framework";
import { type Attachment, ChannelType, chatInputApplicationCommandMention, inlineCode } from "discord.js";

export class BotUtilities extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "bot",
        });
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
            if (error instanceof QueryError) {
                this.container.logger.error(`ToolboxUtilities: Error validating URL ${url}:`, error);
                return false;
            }

            return false;
        }
    }

    public isValidImageExtension(url: string): boolean {
        const imageExtensionPattern = /\.(jpg|jpeg|png)$/i;

        try {
            return imageExtensionPattern.test(new URL(url).pathname);
        } catch {
            return false;
        }
    }

    public isValidImageContentType(attachment: Attachment): boolean {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
         */
        const imageContentTypes: string[] = ["image/jpeg", "image/png"];

        return imageContentTypes.includes(attachment.contentType ?? "");
    }

    public isValidAttachment(attachment: Attachment): boolean {
        return this.isValidImageContentType(attachment) && this.isValidImageExtension(attachment.url);
    }
}
