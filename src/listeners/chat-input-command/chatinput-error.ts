import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaEvents } from "@/lib/extensions/events";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { ArgumentError, type ChatInputCommandErrorPayload, Listener, UserError } from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import { type InteractionResponse, type Message, codeBlock } from "discord.js";

export class ChatInputCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: Error, payload: ChatInputCommandErrorPayload): Promise<Message | InteractionResponse> {
        const { repos, logger } = this.container;
        const { interaction, command } = payload;

        const entry: boolean = await repos.history.newEntry({
            userId: interaction.user.id,
            guildId: interaction.guild?.id ?? "",
            commandName: command.name,
            status: "error",
            type: "slash",
        });

        if (!entry) {
            logger.warn("ChatInputCommandErrorListener: Failed to add command history entry.");
        }

        logger.info(
            `ChatInputCommandErrorListener: Command ${command.name} error for ${interaction.user.username} in ${interaction.guild?.name ?? "DMs"}.`,
        );

        if (error instanceof UserError) return this.handleUserError(error, payload);
        if (error instanceof ArgumentError) return this.handleArgumentError(error, payload);

        return payload.interaction.reply(
            `>⌓<｡ An unhandled error occurred while executing this command!\n${codeBlock(`${error.message}`)}`,
        );
    }

    private handleUserError(error: UserError, payload: ChatInputCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("error");

        embed.setFooter({
            text: `Error Identifier: ${capitalizeFirstLetter(error.identifier)}`,
        });

        switch (error.identifier) {
            case ImperiaIdentifiers.ArgsMissing:
                return payload.interaction.reply(error.message);
            case ImperiaIdentifiers.ArgumentFilterImageError ||
                ImperiaIdentifiers.ArgumentEffectImageError ||
                ImperiaIdentifiers.ArgumentEffectMonochromeError:
                return payload.interaction.reply(error.message);
            default:
                embed.setTitle(">⌓<｡ An error occurred while executing this command!");
                embed.setDescription(error.message);
                break;
        }

        return payload.interaction.reply({ embeds: [embed] });
    }

    private handleArgumentError(error: ArgumentError, payload: ChatInputCommandErrorPayload) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();

        embed.setFooter({
            text: `Error Identifier: ${capitalizeFirstLetter(error.identifier)}`,
        });

        embed.setTitle(">⌓<｡ An error occurred while parsing arguments for this command!");
        embed.setDescription(codeBlock(`${error.identifier}\n\n${error.message}`));

        return payload.interaction.reply({ embeds: [embed] });
    }
}
