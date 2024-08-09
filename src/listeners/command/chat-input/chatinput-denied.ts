import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
import type { MessageChatResponse } from "@/lib/types/union";
import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import type {} from "discord.js";

export class ChatInputCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload): Promise<MessageChatResponse> {
        const { database, logger } = this.container;
        const { interaction, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: interaction.user.id,
                guildId: interaction.guildId as string,
                command: command.name,
                result: "denied",
                type: "chatinput",
            })
            .returning();

        if (!entry) {
            logger.warn("ChatInputCommandDeniedListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `ChatInputCommandDeniedListener: Command "${command.name}" by user "${interaction.user.id}" in guild "${interaction.guildId}" was denied.`,
            );
        }

        logger.debug(`ChatInputCommandDeniedListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
