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

        switch (error.identifier) {
            case ImperiaIdentifiers.PreconditionCooldown:
                embed.setDescription("Please wait before using this command again.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });
            case ImperiaIdentifiers.PreconditionUserPermissions ||
                ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions:
                embed.setDescription("You do not have the required permissions to use this command.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });
            case ImperiaIdentifiers.PreconditionClientPermissions ||
                ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions:
                embed.setDescription("I do not have the required permissions to use this command.");
                return data.interaction.reply({ embeds: [embed], ephemeral: true });
            default:
                this.container.logger.error(error);
                embed.setDescription(
                    `An error occurred while executing this command.\n${error.identifier}\n${error.message}`,
                );
                return data.interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
