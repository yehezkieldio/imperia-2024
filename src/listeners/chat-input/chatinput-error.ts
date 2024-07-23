import { ImperiaEvents } from "@/core/extensions/events";
import { ImperiaListener } from "@/core/extensions/listener";
import type { ChatInputCommandErrorPayload, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, codeBlock } from "discord.js";

export class ChatInputCommandErrorListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandErrorPayload): Promise<Message | InteractionResponse> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.interaction.user.id,
            guildId: payload.interaction.guildId as string,
            commandName: payload.command.name,
            status: "error",
            type: "slash",
        });

        if (!historyEntry) {
            this.container.logger.warn("ChatInputCommandErrorListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `ChatInputCommandErrorListener: Failed to execute slash command ${payload.command.name} by ${payload.interaction.user.id} in ${payload.interaction.guildId}.`,
        );

        if (payload.interaction.deferred || payload.interaction.replied) {
            return payload.interaction.editReply({
                content: `An error occurred while executing this command! Here's what went wrong:\n${codeBlock(`${error.identifier}\n\n${error.message}`)}`,
            });
        }

        return payload.interaction.reply({
            content: `An error occurred while executing this command! Here's what went wrong:\n${codeBlock(`${error.identifier}\n\n${error.message}`)}`,
        });
    }
}
