import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
import type { MessageChatResponse } from "@/lib/types/union";
import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload): Promise<MessageChatResponse> {
        const { database, logger } = this.container;
        const { message, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: message.author.id,
                guildId: message.guildId as string,
                command: command.name,
                result: "denied",
                type: "message",
            })
            .returning();

        if (!entry) {
            logger.warn("MessageCommandDeniedListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `MessageCommandDeniedListener: Command "${command.name}" by user "${message.author.id}" in guild "${message.guildId}" was denied.`,
            );
        }

        logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
