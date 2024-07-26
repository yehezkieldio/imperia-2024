import { ImperiaEvents } from "@/lib/extensions/events";
import { type ChatInputCommandSuccessPayload, Listener } from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandSuccess,
        });
    }

    public async run(payload: ChatInputCommandSuccessPayload): Promise<void> {
        const { repos, logger } = this.container;
        const { interaction, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: interaction.user.id,
            guildId: interaction.guild?.id ?? "",
            commandName: command.name,
            status: "success",
            type: "slash",
        });

        if (!entry) {
            logger.warn("ChatInputCommandSuccessListener: Failed to add command history entry.");
        }

        logger.info(
            `ChatInputCommandSuccessListener: Command ${command.name} executed successfully for ${interaction.user.username} in ${interaction.guild?.name ?? "DMs"}.`,
        );
    }
}
