import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import type { WikipediaQueryResult } from "@/internal/types/wikipedia";
import { trimString } from "@/internal/utils/string-utils";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class WikipediaCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Search Wikipedia for information about an article.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("article")
                    .setDescription("The title of the article you want to search for.")
                    .setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });

        const article: string = interaction.options.getString("article", true);

        const result = await this.wikipediaSearch(article);

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = trimString(result.extract, 2048);
        const description = trimDescription;

        const response = new ImperiaEmbedBuilder();

        response.setAuthor({
            name: result.title,
            url: result.content_urls.desktop.page,
        });

        response.setDescription(description);

        if (result.thumbnail) response.setThumbnail(result.thumbnail.source);

        return interaction.editReply({
            embeds: [response],
        });
    }

    private async wikipediaSearch(article: string): Promise<WikipediaQueryResult | undefined> {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.replace(/\s/g, "_"))}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }).then((response) => response.json());

            return response;
        } catch (error) {
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.SearchResultsNotFound,
                message: "No results found for the provided search.",
                context: { article },
            });
        }
    }
}
