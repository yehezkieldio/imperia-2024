import type { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaEvents } from "@/core/extensions/events";
import { ImperiaListener } from "@/core/extensions/listener";
import type { ChatInputCommandDeniedPayload, UserError } from "@sapphire/framework";
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

        const embed: ImperiaEmbedBuilder = this.container.utilities.toolbox.generateCommandDeniedEmbed(error);

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
