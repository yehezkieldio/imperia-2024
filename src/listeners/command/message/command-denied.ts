import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload) {
        const { logger, services } = this.container;
        const { message, command } = payload;

        const result: string = await services.analytics.command({
            context: message,
            command: command.name,
            result: "denied",
            type: "message",
        });

        logger.info(`MessageCommandDeniedListener: ${result}`);
        logger.debug(`MessageCommandDeniedListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
