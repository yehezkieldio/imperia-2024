import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
import type { MessageChatResponse } from "@/lib/types/union";
import { Listener, type MessageCommandErrorPayload, type UserError } from "@sapphire/framework";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: UserError, payload: MessageCommandErrorPayload): Promise<MessageChatResponse> {
        const { database, logger } = this.container;
        const { message, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: message.author.id,
                guildId: message.guildId as string,
                command: command.name,
                result: "error",
                type: "message",
            })
            .returning();

        if (!entry) {
            logger.warn("MessageCommandErrorListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `MessageCommandErrorListener: Command "${command.name}" by user "${message.author.id}" in guild "${message.guildId}" was errored.`,
            );
        }

        logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
