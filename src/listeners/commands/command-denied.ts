import { newCommandUsageEntry } from "@/internal/database/utils";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaEvents } from "@/internal/types/events";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import type { InteractionResponse } from "discord.js";

export class ChatInputCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, data: ChatInputCommandDeniedPayload): Promise<InteractionResponse<boolean>> {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isErrorEmbed();

        await newCommandUsageEntry({
            commandName: data.interaction.commandName,
            userId: data.interaction.user.id,
            guildId: data.interaction.guildId ?? "dm",
            status: "denied",
        });

        switch (error.identifier) {
            // Catch for when the command is disabled
            case ImperiaIdentifiers.CommandDisabled:
                embed.setDescription("This command has been disabled.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the command is guild only.
            // TODO: Current identifier is deprecated, update to the new recommended identifier.
            case ImperiaIdentifiers.PreconditionGuildOnly:
                embed.setDescription("This command can only be used in a server.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the user does not have the required cooldown
            case ImperiaIdentifiers.PreconditionCooldown:
                embed.setDescription("Please wait before using this command again.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the user does not have the required permissions
            case ImperiaIdentifiers.PreconditionUserPermissions ||
                ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions:
                embed.setDescription("You do not have the required permissions to use this command.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the bot does not have the required permissions
            case ImperiaIdentifiers.PreconditionClientPermissions ||
                ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions:
                embed.setDescription("I do not have the required permissions to use this command.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch all for any other errors
            default:
                this.container.logger.error(error);
                embed.setDescription(
                    `An error occurred while executing this command.\n${error.identifier}\n${error.message}`,
                );
                return data.interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
