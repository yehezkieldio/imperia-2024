import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
import { Listener, type MessageCommandSuccessPayload } from "@sapphire/framework";

export class MessageCommandSuccessListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandSuccess,
        });
    }

    public async run(payload: MessageCommandSuccessPayload): Promise<void> {
        const { database, logger } = this.container;
        const { message, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: message.author.id,
                guildId: message.guildId as string,
                command: command.name,
                result: "success",
                type: "message",
            })
            .returning();

        if (!entry) {
            logger.warn("MessageCommandSuccessListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `MessageCommandSuccessListener: Command "${command.name}" by user "${message.author.id}" in guild "${message.guildId}" was successful.`,
            );
        }
    }
}
