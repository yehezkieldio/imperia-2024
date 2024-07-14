import { newCommandUsageEntry } from "@/internal/database/utils";
import { ImperiaEvents } from "@/internal/types/events";
import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";
import { bold } from "discord.js";

export class ChatInputCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
        await newCommandUsageEntry({
            commandName: interaction.commandName,
            userId: interaction.user.id,
            guildId: interaction.guildId ?? "dm",
            status: "error",
        });

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: `${bold(error.identifier)}: ${error.message}`,
            });
        }

        return interaction.reply({
            content: `${bold(error.identifier)}: ${error.message}`,
        });
    }
}
