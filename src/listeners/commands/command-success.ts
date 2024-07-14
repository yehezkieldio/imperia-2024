import { newCommandUsageEntry } from "@/internal/database/utils";
import { ImperiaEvents } from "@/internal/types/events";
import { type ChatInputCommandSuccessPayload, Listener, type UserError } from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandSuccess,
        });
    }

    public async run(error: UserError, data: ChatInputCommandSuccessPayload) {
        await newCommandUsageEntry({
            commandName: data.interaction.commandName,
            userId: data.interaction.user.id,
            guildId: data.interaction.guildId ?? "dm",
            status: "success",
        });
    }
}
