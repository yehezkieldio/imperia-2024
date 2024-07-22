import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaListener } from "@/core/extensions/listener";
import { ImperiaEvents } from "@/core/types/events";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import { ArgumentError, type MessageCommandErrorPayload, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, codeBlock } from "discord.js";

export class MessageCommandErrorListener extends ImperiaListener {
    public constructor(context: ImperiaListener.Context, options: ImperiaListener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: Error, payload: MessageCommandErrorPayload): Promise<Message | InteractionResponse> {
        const historyEntry: boolean = await this.container.utilities.historyRepo.addCommandHistory({
            userId: payload.message.author.id,
            guildId: payload.message.guildId as string,
            commandName: payload.command.name,
            status: "error",
            type: "message",
        });

        if (!historyEntry) {
            this.container.logger.warn("MessageCommandErrorListener: Failed to add command history entry.");
        }

        this.container.logger.info(
            `MessageCommandErrorListener: Failed to execute slash command ${payload.command.name} by ${payload.message.author.id} in ${payload.message.guildId}.`,
        );

        if (error instanceof UserError) return this.handleUserError(error, payload);
        if (error instanceof ArgumentError) return this.handleArgumentError(error, payload);

        return payload.message.channel.send(
            `An unhandled error occurred while executing this command!\n${codeBlock(`${error.message}`)}`,
        );
    }

    private handleUserError(error: UserError, payload: MessageCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isErrorEmbed();

        if (error.identifier === ImperiaIdentifiers.ArgsMissing) {
            embed.setTitle("I am missing required arguments to execute this command!");
            embed.setDescription(error.message);
        } else {
            embed.setTitle("An error occurred while executing this command!");
            embed.setDescription(error.message);
        }

        return payload.message.channel.send({ embeds: [embed] });
    }

    private handleArgumentError(error: ArgumentError, payload: MessageCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();

        embed.setTitle("An error occurred while parsing arguments for this command!");
        embed.setDescription(codeBlock(`${error.identifier}\n\n${error.message}`));

        return payload.message.channel.send({ embeds: [embed] });
    }
}
