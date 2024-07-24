import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import type { WikipediaPageSummary } from "@/types/wikipedia";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { cutText } from "@sapphire/utilities";
import { type Message, SlashCommandBuilder } from "discord.js";

export class WikipediaCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Searches Wikipedia for a summary of the given article.",
            aliases: ["wiki"],
            tags: ["information"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("article").setDescription("The article to search for.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply();

        const article: string = interaction.options.getString("article", true);
        const embed: ImperiaEmbedBuilder = await this.generateResponseEmbed(article);

        return interaction.editReply({ embeds: [embed] });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const articleArgument: ResultType<string> = await args.restResult("string");

        if (articleArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "Please provide an article to search for.",
            });
        }

        const article: string = articleArgument.unwrap();
        const embed: ImperiaEmbedBuilder = await this.generateResponseEmbed(article);

        return message.reply({ embeds: [embed] });
    }

    private async generateResponseEmbed(article: string): Promise<ImperiaEmbedBuilder> {
        const result: WikipediaPageSummary | undefined = await this.container.services.api.searchWikipedia(article);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isInformationEmbed();

        if (!result) {
            embed.setDescription("No results found for the given article!");
            return embed;
        }

        const extract = cutText(result.extract, 1024);

        embed.setTitle(result.title);
        embed.setDescription(`${extract}\n\nRead more [here](${result.content_urls.desktop.page}).`);

        return embed;
    }
}
