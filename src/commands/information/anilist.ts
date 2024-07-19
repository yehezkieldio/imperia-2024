interface AnilistCoverImage {
    large: string;
}

interface AnilistTitle {
    romaji: string;
    native: string;
    english: string;
}

interface AnilistExternalLinks {
    url: string;
}

export interface AnilistQueryResponse {
    id: number;
    description: string;
    coverImage: AnilistCoverImage;
    title: AnilistTitle;
    externalLinks: AnilistExternalLinks[];
    bannerImage?: string;
    format?: string;
    averageScore?: number;
    episodes?: number;
    status?: string;
    duration?: number;
}

import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import type { DragonflySearchResult } from "@/internal/typings/dragonfly";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

export class AnilistCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Search Anilist for information about an anime or manga.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
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
            )
            .addBooleanOption((option) =>
                option.setName("cached").setDescription("Whether to use cached data or not.").setRequired(false),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const title: string = interaction.options.getString("title", true);
        const type: string = interaction.options.getString("type") ?? "anime";
        const cached: boolean = interaction.options.getBoolean("cached") ?? true;

        if (["anime", "manga"].includes(type) === false) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("Invalid media type.")],
            });
        }

        const result: AnilistQueryResponse | undefined = await this.anilistSearch(
            title,
            type as "anime" | "manga",
            cached,
        );

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = this.utils.trimString(result.description, 2048);
        const description = this.utils.stripHtmlTags(trimDescription);

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
        cached = true,
    ): Promise<AnilistQueryResponse | undefined> {
        if (cached) {
            const cachedResult = await this.getCachedData(search, type);
            if (cachedResult) {
                return cachedResult;
            }
        }

        const url = "https://graphql.anilist.co";
        const mediaType: "ANIME" | "MANGA" = type === "anime" ? "ANIME" : "MANGA";

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
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
                body: JSON.stringify({ query, variables }),
            }).then((response) => response.json());

            await this.setCachedData(search, type, response.data.Media);

            return response.data.Media;
        } catch (error) {
            this.container.logger.error(error);

            const cached = await this.getCachedData(search, type);
            if (cached) return cached;

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "No results found for the provided search.",
                context: { search, type },
            });
        }
    }

    private async setCachedData(
        search: string,
        type: "anime" | "manga",
        data: AnilistQueryResponse,
        ttl = 3600,
    ): Promise<void> {
        const key = `anilist_search_${type}_${search.toLowerCase()}`;
        await this.container.df.hset(key, {
            type,
            search: search.toLowerCase(),
            data: JSON.stringify(data),
        });
        await this.container.df.expire(key, ttl);
    }

    private async getCachedData(search: string, type: "anime" | "manga"): Promise<AnilistQueryResponse | null> {
        const query = `@type:{${type}} @search:(${search.toLowerCase()})`;
        const searchResults = (await this.container.df.call(
            "FT.SEARCH",
            "anilist_idx",
            query,
            "LIMIT",
            "0",
            "1",
        )) as DragonflySearchResult;

        if (searchResults[0] === 0) {
            return null;
        }

        return this.parseAnilistData(searchResults);
    }

    private parseAnilistData(array: DragonflySearchResult): AnilistQueryResponse {
        const [, , [, , , dataStr]] = array;
        const data: AnilistQueryResponse = JSON.parse(dataStr);

        return data;
    }
}
