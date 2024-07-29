import { ImperiaEvents } from "@/lib/extensions/events";
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
        const { repos, logger } = this.container;
        const { message, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: message.author.id,
            guildId: message.guild?.id ?? "",
            commandName: command.name,
            status: "success",
            type: "message",
        });

        if (!entry) {
            logger.warn("MessageCommandSuccessListener: Failed to add command history entry.");
        }

        logger.info(
            `MessageCommandSuccessListener: Command ${command.name} executed successfully for ${message.author.username} in ${message.guild?.name ?? "DMs"}.`,
        );
    }
}
