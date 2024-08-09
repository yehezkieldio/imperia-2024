import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { type ChatInputCommandDeniedPayload, Listener, type UserError } from "@sapphire/framework";

export class ChatInputCommadDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        const { logger, services } = this.container;
        const { interaction, command } = payload;

        const result: string = await services.analytics.command({
            context: interaction,
            command: command.name,
            result: "denied",
            type: "chatinput",
        });

        logger.info(`ChatInputCommadDeniedListener: ${result}`);
        logger.debug(`ChatInputCommadDeniedListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
