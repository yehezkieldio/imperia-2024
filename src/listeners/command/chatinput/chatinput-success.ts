import { ImperiaEvents } from "@/lib/extensions/contants/events";
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
        const { logger, services } = this.container;
        const { interaction, command } = payload;

        const result: string = await services.analytics.command({
            context: interaction,
            command: command.name,
            result: "success",
            type: "chatinput",
        });

        logger.info(`ChatInputCommandSuccessListener: ${result}`);
    }
}
