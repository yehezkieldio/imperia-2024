import { ImperiaEvents } from "@/core/extensions/events";
import { ImperiaListener } from "@/core/extensions/listener";
import type { ChatInputCommandSuccessPayload } from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandSuccess,
        });
    }

    public async run(payload: ChatInputCommandSuccessPayload): Promise<void> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.interaction.user.id,
            guildId: payload.interaction.guildId as string,
            commandName: payload.command.name,
            status: "success",
            type: "slash",
        });

        if (!historyEntry) {
            this.container.logger.warn("ChatInputCommandSuccessListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `ChatInputCommandSuccessListener: Successfully executed slash command ${payload.command.name} by ${payload.interaction.user.id} in ${payload.interaction.guildId}.`,
        );
    }
}
