import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import type { WikipediaSummary } from "@/types/services";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder, bold } from "discord.js";

export class WikipediaSummaryCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a summary of a Wikipedia article.",
            aliases: ["wikipediasummary"],
            tags: ["information", "wikipedia"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("title").setDescription("The title of the Wikipedia article.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const title: string = interaction.options.getString("title", true);

        const { embed, response } = await this.generateResponse(title);

        return interaction.reply({
            embeds: [embed],
            content: response,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const titleArgument: ResultType<string> = await args.restResult("string");

        if (titleArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide a title for me to search! How am I supposed to find anything?",
            });
        }

        const title: string = titleArgument.unwrap();
        const { embed, response } = await this.generateResponse(title);

        return message.reply({
            embeds: [embed],
            content: response,
        });
    }

    private async generateResponse(articleTitle: string) {
        const { text } = this.container.utilities;
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();
        const summary: WikipediaSummary | undefined = await this.container.services.wikipedia.summary(articleTitle);

        if (!summary) {
            embed.isErrorEmbed();
            embed.setDescription("— Please refine your search query and try again.");

            return {
                embed: embed,
                response: "( ・⌓・｀) I couldn't find any results for your search query!",
            };
        }

        embed.isInformationEmbed();

        const isDisambiguation: boolean = summary.type === "disambiguation";

        const title: string = isDisambiguation ? bold(summary.titles.canonical) : bold(summary.title);
        const description: string = isDisambiguation ? "Disambiguation." : text.addDotToEnd(summary.description);

        let extract: string = text.parseExtract(summary.extract_html);
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
