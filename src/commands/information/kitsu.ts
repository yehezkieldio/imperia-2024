import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import type { DragonflySearchResult } from "@/internal/typings/dragonfly";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface KitsuLinks {
    self: string;
}

interface KitsuTitles {
    en_jp: string;
    ja_jp: string;
}

interface KitsuImage {
    tiny: string;
    small: string;
    medium?: string;
    large: string;
    original: string;
}

interface KitsuAttributes {
    description: string;
    titles: KitsuTitles;
    canonicalTitle: string;
    abbreviatedTitles: string[];
    posterImage: KitsuImage;
    coverImage: Omit<KitsuImage, "medium">;
}

interface KitsuQueryResponse {
    links: KitsuLinks;
    attributes: KitsuAttributes;
}

export class KitsuCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Search Kitsu for information about an anime or manga.",
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

        const result: KitsuQueryResponse | undefined = await this.kitsuSearch(title, type as "anime" | "manga", cached);

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = this.utils.trimString(result.attributes.description, 2048);
        const description = this.utils.stripHtmlTags(trimDescription);

        const response = new ImperiaEmbedBuilder();

        response.setAuthor({
            name: `${result.attributes.titles.en_jp} (${result.attributes.titles.ja_jp})`,
        });
        response.setDescription(description);
        response.setThumbnail(result.attributes.posterImage.large);

        if (result.attributes.coverImage.original) response.setImage(result.attributes.coverImage.original);

        return interaction.editReply({
            embeds: [response],
        });
    }

    private async kitsuSearch(
        title: string,
        type: "anime" | "manga" = "anime",
        cached = true,
    ): Promise<KitsuQueryResponse | undefined> {
        if (cached) {
            const cachedResult = await this.getCachedData(title, type);
            if (cachedResult) {
                return cachedResult;
            }
        }

        const url = "https://kitsu.io/api/edge/";
        const search = encodeURIComponent(title);

        try {
            const response = await fetch(`${url}/${type}?filter[text]=${search}`, {
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                },
            }).then((response) => response.json());

            if (response.data.length === 0) {
                new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: "No results found for the provided search.",
                    context: { search, type },
                });
            }

            await this.setCachedData(title, type, response.data[0]);

            return response.data[0];
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
        data: KitsuQueryResponse,
        ttl = 3600,
    ): Promise<void> {
        const key = `kitsu_search_${type}_${this.utils.slugify(search)}`;
        await this.container.df.hset(key, {
            type,
            search: search.toLowerCase(),
            data: JSON.stringify(data),
        });
        await this.container.df.expire(key, ttl);
    }

    private async getCachedData(search: string, type: "anime" | "manga"): Promise<KitsuQueryResponse | null> {
        const query = `@type:{${type}} @search:(${search.toLowerCase()})`;
        const searchResults = (await this.container.df.call(
            "FT.SEARCH",
            "kitsu_idx",
            query,
            "LIMIT",
            "0",
            "1",
        )) as DragonflySearchResult;

        if (searchResults[0] === 0) {
            return null;
        }

        return this.parseKitsuData(searchResults);
    }

    private parseKitsuData(array: DragonflySearchResult): KitsuQueryResponse {
        const [, , [, , , dataStr]] = array;
        const data: KitsuQueryResponse = JSON.parse(dataStr);

        return data;
    }
}
