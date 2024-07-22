import { ImperiaListener } from "@/core/extensions/listener";
import { ImperiaEvents } from "@/core/types/events";
import type { MessageCommandErrorPayload, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, MessageType, codeBlock } from "discord.js";

export class MessageCommandErrorListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandErrorPayload): Promise<Message | InteractionResponse> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.message.author.id,
            guildId: payload.message.guildId as string,
            commandName: payload.command.name,
            status: "error",
            type: "message",
        });

        if (!historyEntry) {
            this.container.logger.warn("MessageCommandErrorListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `MessageCommandErrorListener: Failed to execute slash command ${payload.command.name} by ${payload.message.author.id} in ${payload.message.guildId}.`,
        );

        if (payload.message.type === MessageType.Reply) {
            return payload.message.edit({
                content: `An error occurred while executing this command! Here's what went wrong:\n${codeBlock(`${error.identifier}\n\n${error.message}`)}`,
            });
        }

        return payload.message.channel.send({
            content: `An error occurred while executing this command! Here's what went wrong:\n${codeBlock(`${error.identifier}\n\n${error.message}`)}`,
        });
    }
}
