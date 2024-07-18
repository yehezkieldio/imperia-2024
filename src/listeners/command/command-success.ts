import { commandUsage } from "@/internal/database/postgres/schema";
import { ImperiaEvents } from "@/internal/extensions/events";
import { ImperiaListener } from "@/internal/extensions/listener";
import type { ChatInputCommandSuccessPayload } from "@sapphire/framework";
import type {} from "discord.js";

export class ChatInputCommandSuccessListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: true,
            event: ImperiaEvents.ContextMenuCommandSuccess,
        });
    }

    public async run(payload: ChatInputCommandSuccessPayload) {
        await this.container.db.insert(commandUsage).values({
            command: payload.interaction.commandName,
            discordId: payload.interaction.user.id,
            guildId: payload.interaction.guildId || "dm",
            status: "success",
            timestamp: new Date(),
        });
    }
}
