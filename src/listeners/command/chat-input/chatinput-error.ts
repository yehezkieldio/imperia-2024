import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
import type { MessageChatResponse } from "@/lib/types/union";
import { type ChatInputCommandErrorPayload, Listener, type UserError } from "@sapphire/framework";

export class ChatInputCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandErrorPayload): Promise<MessageChatResponse> {
        const { database, logger } = this.container;
        const { interaction, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: interaction.user.id,
                guildId: interaction.guildId as string,
                command: command.name,
                result: "error",
                type: "chatinput",
            })
            .returning();

        if (!entry) {
            logger.warn("ChatInputCommandErrorListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `ChatInputCommandErrorListener: Command "${command.name}" by user "${interaction.user.id}" in guild "${interaction.guildId}" errored.`,
            );
        }

        logger.debug(`ChatInputCommandErrorListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
