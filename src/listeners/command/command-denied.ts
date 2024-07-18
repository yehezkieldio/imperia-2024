import { commandUsage } from "@/internal/database/postgres/schema";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaEvents } from "@/internal/extensions/events";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { ImperiaListener } from "@/internal/extensions/listener";
import type { ChatInputCommandDeniedPayload, UserError } from "@sapphire/framework";
import type { InteractionResponse } from "discord.js";

export class ChatInputCommandDeniedListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload): Promise<InteractionResponse<boolean>> {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isErrorEmbed();

        await this.container.db.insert(commandUsage).values({
            command: payload.interaction.commandName,
            discordId: payload.interaction.user.id,
            guildId: payload.interaction.guildId || "dm",
            status: "error",
            timestamp: new Date(),
        });

        switch (error.identifier) {
            // Catch for when the command is disabled
            case ImperiaIdentifiers.CommandDisabled:
                embed.setDescription("This command has been disabled.");
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the command is guild only.
            // TODO: Current identifier is deprecated, update to the new recommended identifier.
            case ImperiaIdentifiers.PreconditionGuildOnly:
                embed.setDescription("This command can only be used in a server.");
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the user does not have the required cooldown
            case ImperiaIdentifiers.PreconditionCooldown:
                embed.setDescription("Please wait before using this command again.");
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the user does not have the required permissions
            case ImperiaIdentifiers.PreconditionUserPermissions ||
                ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions:
                embed.setDescription("You do not have the required permissions to use this command.");
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch for when the bot does not have the required permissions
            case ImperiaIdentifiers.PreconditionClientPermissions ||
                ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions:
                embed.setDescription("I do not have the required permissions to use this command.");
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });

            // Catch all for any other errors
            default:
                this.container.logger.error(error);
                embed.setDescription(
                    `An error occurred while executing this command.\n${error.identifier}\n${error.message}`,
                );
                return payload.interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
