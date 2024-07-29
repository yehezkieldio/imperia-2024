import { ImperiaEvents } from "@/lib/extensions/events";
import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import type { InteractionResponse, Message } from "discord.js";

export class ChatInputCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload): Promise<Message | InteractionResponse> {
        const { repos, logger, utilities } = this.container;
        const { interaction, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: interaction.user.id,
            guildId: interaction.guild?.id ?? "",
            commandName: command.name,
            status: "denied",
            type: "slash",
        });

        if (!entry) {
            logger.warn("ChatInputCommandDeniedListener: Failed to add command history entry.");
        }

        logger.info(
            `ChatInputCommandDeniedListener: Command ${command.name} denied for ${interaction.user.username} in ${interaction.guild?.name ?? "DMs"}.`,
        );

        const response: string = utilities.toolbox.generateCommandDeniedResponse(error);
        return interaction.reply({
            content: response,
        });
    }
}
