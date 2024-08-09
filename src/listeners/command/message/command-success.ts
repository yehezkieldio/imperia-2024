import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { Listener, type MessageCommandSuccessPayload } from "@sapphire/framework";

export class MessageCommandSuccessListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandSuccess,
        });
    }

    public async run(payload: MessageCommandSuccessPayload) {
        const { logger, services } = this.container;
        const { message, command } = payload;

        const result: string = await services.analytics.command({
            context: message,
            command: command.name,
            result: "success",
            type: "message",
        });

        logger.info(`MessageCommandSuccessListener: ${result}`);
    }
}
