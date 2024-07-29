import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { Utility } from "@/lib/stores/utilities";
import { FetchResultTypes, QueryError, fetch } from "@sapphire/fetch";
import type { UserError } from "@sapphire/framework";
import { type Attachment, ChannelType, chatInputApplicationCommandMention, inlineCode } from "discord.js";

export class ToolboxUtilities extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "toolbox",
        });
    }

    public generateCommandDeniedResponse(error: UserError) {
        /* -------------------------- GLOBAL PRECONDITIONS -------------------------- */

        if (error.identifier === ImperiaIdentifiers.BlacklistedServer) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.BlacklistedUser) {
            return error.message;
        }

        /* -------------------------- GENERAL PRECONDITIONS -------------------------- */

        if (error.identifier === ImperiaIdentifiers.InvalidArgumentProvided) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.CommandDisabled) {
            return "｀(^ ▼^)´↑ This command is globally disabled! Please try again later...";
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionCooldown) {
            return "(｡･･｡) This command is on cooldown! Please wait for the cooldown to expire...";
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionRunIn) {
            return `(￣ｰ￣) This command is not available in this context! Please use this command in a ${this.getChannelType(error)}`;
        }

        /* ------------------------ PERMISSION PRECONDITIONS ------------------------ */

        if (
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions
        ) {
            return `( /・・)ノ I am missing required permissions to execute this command!\nRequired permission(s): ${this.getMissingPermissions(error)}`;
        }

        if (
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions
        ) {
            return `( /・・)ノ You are missing required permissions to execute this command!\nRequired permission(s): ${this.getMissingPermissions(error)}`;
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return ">⌓<｡ Unhandled error occurred while executing this command!";
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
