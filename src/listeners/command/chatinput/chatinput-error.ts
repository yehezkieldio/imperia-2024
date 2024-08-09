import { ImperiaEvents } from "@/lib/extensions/contants/events";
import { type ChatInputCommandErrorPayload, Listener, type UserError } from "@sapphire/framework";

export class ChatInputCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandErrorPayload) {
        const { logger, services } = this.container;
        const { interaction, command } = payload;

        const result: string = await services.analytics.command({
            context: interaction,
            command: command.name,
            result: "error",
            type: "chatinput",
        });

        logger.info(`ChatInputCommandErrorListener: ${result}`);
        logger.debug(`ChatInputCommandErrorListener: ${error.identifier}`);

        return interaction.reply({
            content: `${error.identifier}\n${error.message}`,
        });
    }
}
