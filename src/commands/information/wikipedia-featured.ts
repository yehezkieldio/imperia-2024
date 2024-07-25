import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import type { WikipediaFeatured } from "@/types/services";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder, bold } from "discord.js";

export class WikipediaFeaturedCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a summary of a the featured of the day on Wikipedia.",
            aliases: ["wikipediafeatured"],
            tags: ["information", "wikipedia"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const { embed, response } = await this.generateResponse();

        return interaction.reply({
            embeds: [embed],
            content: response,
        });
    }

    public async messageRun(message: Message): Promise<Message> {
        const { embed, response } = await this.generateResponse();

        return message.reply({
            embeds: [embed],
            content: response,
        });
    }

    private async generateResponse() {
        const { text } = this.container.utilities;
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();
        const summary: WikipediaFeatured | undefined = await this.container.services.wikipedia.featured();

        if (!summary) {
            embed.isErrorEmbed();
            embed.setDescription("— Please try again later.");

            return {
                embed: embed,
                response: "( ・⌓・｀) I couldn't find any featured articles at the moment.",
            };
        }

        embed.isInformationEmbed();

        const isDisambiguation: boolean = summary.tfa.type === "disambiguation";

        const title: string = isDisambiguation ? bold(summary.tfa.titles.normalized) : bold(summary.tfa.title);
        const description: string = isDisambiguation ? "Disambiguation." : text.addDotToEnd(summary.tfa.description);

        let extract: string = text.parseExtract(summary.tfa.extract_html);
        extract = `— ${extract}`;

        this.container.logger.debug(`Before ${extract}`);

        if (isDisambiguation) extract = text.disambiguation(extract);
        else extract = text.getFirstTwoParagraphs(extract);

        embed.setDescription(`${title}, ${description}\n\n${extract}`);

        this.container.logger.debug(`After ${extract}`);

        return {
            embed: embed,
            response: "˖ ݁𖥔 ݁˖ Here's what I got for you~",
        };
    }
}
