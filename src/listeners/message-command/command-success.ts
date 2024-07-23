import { ImperiaEvents } from "@/core/extensions/events";
import { ImperiaListener } from "@/core/extensions/listener";
import type { MessageCommandSuccessPayload } from "@sapphire/framework";

export class MessageCommandSuccessListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandSuccess,
        });
    }

    public async run(payload: MessageCommandSuccessPayload): Promise<void> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.message.author.id,
            guildId: payload.message.guildId as string,
            commandName: payload.command.name,
            status: "success",
            type: "message",
        });

        if (!historyEntry) {
            this.container.logger.warn("MessageCommandSuccessListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `MessageCommandSuccessListener: Successfully executed message command ${payload.command.name} by ${payload.message.author.id} in ${payload.message.guildId}.`,
        );
    }
}
