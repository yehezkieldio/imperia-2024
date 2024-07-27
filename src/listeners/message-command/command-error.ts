import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaEvents } from "@/lib/extensions/events";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { ArgumentError, Listener, type MessageCommandErrorPayload, UserError } from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import { type InteractionResponse, type Message, codeBlock } from "discord.js";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: Error, payload: MessageCommandErrorPayload): Promise<Message | InteractionResponse> {
        const { repos, logger } = this.container;
        const { message, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: message.author.id,
            guildId: message.guild?.id ?? "",
            commandName: command.name,
            status: "error",
            type: "message",
        });

        if (!entry) {
            logger.warn("MessageCommandErrorListener: Failed to add command history entry.");
        }

        logger.info(
            `MessageCommandErrorListener: Command ${command.name} error for ${message.author.username} in ${message.guild?.name ?? "DMs"}.`,
        );

        if (error instanceof UserError) return this.handleUserError(error, payload);
        if (error instanceof ArgumentError) return this.handleArgumentError(error, payload);

        return payload.message.reply(
            `>⌓<｡ An unhandled error occurred while executing this command!\n${codeBlock(`${error.message}`)}`,
        );
    }

    private handleUserError(error: UserError, payload: MessageCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("error");

        embed.setFooter({
            text: `Error Identifier: ${capitalizeFirstLetter(error.identifier)}`,
        });

        switch (error.identifier) {
            case ImperiaIdentifiers.ArgsMissing:
                return payload.message.reply(error.message);
            case ImperiaIdentifiers.InvalidArgumentProvided:
                return payload.message.reply(error.message);
            case ImperiaIdentifiers.ArgumentFilterImageError:
                return payload.message.reply(error.message);
            default:
                embed.setTitle(">⌓<｡ An error occurred while executing this command!");
                embed.setDescription(error.message);
                break;
        }

        return payload.message.reply({ embeds: [embed] });
    }

    private handleArgumentError(error: ArgumentError, payload: MessageCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();

        embed.setFooter({
            text: `Error Identifier: ${capitalizeFirstLetter(error.identifier)}`,
        });

        embed.setTitle(">⌓<｡ An error occurred while parsing arguments for this command!");
        embed.setDescription(codeBlock(`${error.identifier}\n\n${error.message}`));

        return payload.message.reply({ embeds: [embed] });
    }
}
