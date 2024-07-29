import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

interface RandomFact {
    fact: string;
}

export class FactCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Get a random fact.",
            aliases: ["facts"],
            tags: ["text", "fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const result = await this.getFact();

        if (!result) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I can't seem to fetch a fact right now, please try again later.",
            });
        }

        return interaction.reply({ content: result.reply, embeds: [result.embed] });
    }

    public async messageRun(message: Message): Promise<Message> {
        const result = await this.getFact();

        if (!result) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I can't seem to fetch a fact right now, please try again later.",
            });
        }

        return message.reply({ content: result.reply, embeds: [result.embed] });
    }

    private async getFact() {
        const url: string = "https://nekos.life/api/v2/fact";

        try {
            const response = await fetch<RandomFact>(url, FetchResultTypes.JSON);

            const reply = "˖ ݁𖥔 ݁˖ Here's a random fact for you~";

            const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");
            embed.setDescription(response.fact);

            return {
                reply: reply,
                embed: embed,
            };
        } catch (error) {
            this.container.logger.error(error);
        }
    }
}
