import { ImperiaEvents } from "@/lib/extensions/events";
import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";
import type { InteractionResponse, Message } from "discord.js";

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload): Promise<Message | InteractionResponse> {
        const { repos, logger, utilities } = this.container;
        const { message, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: message.author.id,
            guildId: message.guild?.id ?? "",
            commandName: command.name,
            status: "denied",
            type: "message",
        });

        if (!entry) {
            logger.warn("MessageCommandSuccessListener: Failed to add command history entry.");
        }

        logger.info(
            `MessageCommandSuccessListener: Command ${command.name} denied for ${message.author.username} in ${message.guild?.name ?? "DMs"}.`,
        );

        const response: string = utilities.toolbox.generateCommandDeniedResponse(error);
        return message.reply({
            content: response,
        });
    }
}
