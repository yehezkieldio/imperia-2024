import { commandAnalytics } from "@/lib/databases/postgres/schema";
import { ImperiaEvents } from "@/lib/extensions/constants/events";
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
        const { database, logger } = this.container;
        const { interaction, command } = payload;

        const [entry] = await database
            .insert(commandAnalytics)
            .values({
                userId: interaction.user.id,
                guildId: interaction.guildId as string,
                command: command.name,
                result: "success",
                type: "chatinput",
            })
            .returning();

        if (!entry) {
            logger.warn("ChatInputCommandSuccessListener: Failed to insert a new analytics entry. Skipping...");
        } else {
            logger.info(
                `ChatInputCommandSuccessListener: Command "${command.name}" by user "${interaction.user.id}" in guild "${interaction.guildId}" was successful.`,
            );
        }
    }
}
