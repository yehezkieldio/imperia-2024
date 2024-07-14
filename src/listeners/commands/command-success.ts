import { newCommandUsageEntry } from "@/internal/database/utils";
import { ImperiaEvents } from "@/internal/types/events";
import { type ChatInputCommandSuccessPayload, Listener } from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandSuccess,
        });
    }

    public async run(payload: ChatInputCommandSuccessPayload) {
        await newCommandUsageEntry({
            commandName: payload.interaction.commandName,
            userId: payload.interaction.user.id,
            guildId: payload.interaction.guildId ?? "dm",
            status: "success",
        });
    }
}
