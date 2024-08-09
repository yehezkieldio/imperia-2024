import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { Listener, type MessageCommandErrorPayload, type UserError } from "@sapphire/framework";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: UserError, payload: MessageCommandErrorPayload) {
        const { logger, services } = this.container;
        const { message, command } = payload;

        const result: string = await services.analytics.command({
            context: message,
            command: command.name,
            result: "error",
            type: "message",
        });

        logger.info(`MessageCommandErrorListener: ${result}`);
        logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        return message.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
