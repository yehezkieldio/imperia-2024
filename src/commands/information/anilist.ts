import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import type { AnilistQueryResult } from "@/internal/types/anilist";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { stripHtmlTags, trimString } from "@/internal/utils/string-utils";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class AnilistCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Search Anilist for information about an anime or manga.",
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
                    .setName("title")
                    .setDescription("The title of the anime or manga you want to search for.")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("type")
                    .setDescription("The type of media you want to search for.")
                    .addChoices({ name: "Anime", value: "anime" }, { name: "Manga", value: "manga" })
                    .setRequired(false),
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

        const title: string = interaction.options.getString("title", true);
        const type: string = interaction.options.getString("type") ?? "anime";

        if (["anime", "manga"].includes(type) === false) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("Invalid media type.")],
            });
        }

        const result = await this.anilistSearch(title, type as "anime" | "manga");

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = trimString(result.description, 2048);
        const description = stripHtmlTags(trimDescription);

        const response = new ImperiaEmbedBuilder();

        response.setAuthor({
            name: `${result.title.english || result.title.romaji} (${result.title.native})`,
        });
        response.setDescription(description);
        response.setThumbnail(result.coverImage.large);

        if (result.bannerImage) response.setImage(result.bannerImage);

        return interaction.editReply({
            embeds: [response],
        });
    }

    private async anilistSearch(
        search: string,
        type: "anime" | "manga" = "anime",
    ): Promise<AnilistQueryResult | undefined> {
        const url = "https://graphql.anilist.co";
        const mediaType = type === "anime" ? "ANIME" : "MANGA";

        const variables = { search, mediaType };
        const query = `#graphql
        query ($search: String,  $type: MediaType) {
            Media(search: $search, type: $type) {
                id externalLinks { url }
                description
                coverImage { large }
                title { romaji native english }
                bannerImage
                status
                format
                averageScore
                episodes
                duration
            }
        }`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ query, variables }),
            }).then((response) => response.json());

            return response.data.Media;
        } catch (error) {
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.SearchResultsNotFound,
                message: "No results found for the provided search.",
                context: { search, type },
            });
        }
    }
}
