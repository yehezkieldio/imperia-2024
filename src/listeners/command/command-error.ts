import { commandUsage } from "@/internal/database/postgres/schema";
import { ImperiaEvents } from "@/internal/extensions/events";
import { ImperiaListener } from "@/internal/extensions/listener";
import type { ChatInputCommandDeniedPayload, UserError } from "@sapphire/framework";
import { bold } from "discord.js";

export class ChatInputCommandErrorListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        await this.container.db.insert(commandUsage).values({
            command: payload.interaction.commandName,
            discordId: payload.interaction.user.id,
            guildId: payload.interaction.guildId || "dm",
            status: "error",
            timestamp: new Date(),
        });

        if (payload.interaction.deferred || payload.interaction.replied) {
            return payload.interaction.editReply({
                content: `${bold(error.identifier)}: ${error.message}`,
            });
        }

        return payload.interaction.reply({
            content: `${bold(error.identifier)}: ${error.message}`,
        });
    }
}
