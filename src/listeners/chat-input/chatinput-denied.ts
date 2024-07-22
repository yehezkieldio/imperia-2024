import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaListener } from "@/core/extensions/listener";
import { ImperiaEvents } from "@/core/types/events";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import type { ChatInputCommandDeniedPayload, UserError } from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import type { InteractionResponse, Message } from "discord.js";

export class ChatInputCommandDeniedListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload): Promise<Message | InteractionResponse> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.interaction.user.id,
            guildId: payload.interaction.guildId as string,
            commandName: payload.command.name,
            status: "denied",
            type: "slash",
        });

        if (!historyEntry) {
            this.container.logger.warn("ChatInputCommandErrorListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `ChatInputCommandErrorListener: Denied execution of slash command ${payload.command.name} by ${payload.interaction.user.id} in ${payload.interaction.guildId}.`,
        );

        const { toolbox } = this.container.utilities;
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
                embed.setDescription(`Please use this command in a ${toolbox.getChannelType(error)}`);
                break;

            // Permission errors
            case ImperiaIdentifiers.PreconditionClientPermissions ||
                ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions:
                embed.setTitle("I am missing required permissions to execute this command!");
                embed.setDescription(`Required permission(s): ${toolbox.getMissingPermissions(error)}`);
                break;
            case ImperiaIdentifiers.PreconditionUserPermissions ||
                ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions:
                embed.setTitle("You are missing required permissions to execute this command!");
                embed.setDescription(`Required permission(s): ${toolbox.getMissingPermissions(error)}`);
                break;
            default:
                embed.setDescription("Unhandled error occurred while executing this command!");
                break;
        }

        if (payload.interaction.deferred || payload.interaction.replied) {
            return payload.interaction.editReply({
                embeds: [embed],
            });
        }

        return payload.interaction.reply({
            embeds: [embed],
        });
    }
}
