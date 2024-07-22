import type { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaListener } from "@/core/extensions/listener";
import { ImperiaEvents } from "@/core/types/events";
import type { MessageCommandDeniedPayload, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, MessageType } from "discord.js";

export class MessageCommandDeniedListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload): Promise<Message | InteractionResponse> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.message.author.id,
            guildId: payload.message.guildId as string,
            commandName: payload.command.name,
            status: "denied",
            type: "message",
        });

        if (!historyEntry) {
            this.container.logger.warn("MessageCommandDeniedListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `MessageCommandDeniedListener: Failed to execute message command ${payload.command.name} by ${payload.message.author.id} in ${payload.message.guildId}.`,
        );

        const embed: ImperiaEmbedBuilder = this.container.utilities.toolbox.generateErrorEmbed(error);

        if (payload.message.type === MessageType.Reply) {
            return payload.message.edit({
                embeds: [embed],
            });
        }

        return payload.message.channel.send({
            embeds: [embed],
        });
    }
}
