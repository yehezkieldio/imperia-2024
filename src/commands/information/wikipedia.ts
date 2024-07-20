import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

interface WikipediaResponse {
    type: string;
    title: string;
    displaytitle: string;
    namespace: Namespace;
    wikibase_item: string;
    titles: Titles;
    pageid: number;
    thumbnail: Thumbnail;
    originalimage: Thumbnail;
    lang: string;
    dir: string;
    revision: string;
    tid: string;
    timestamp: string;
    description: string;
    description_source: string;
    content_urls: Contenturls;
    extract: string;
    extract_html: string;
}

interface Contenturls {
    desktop: Desktop;
    mobile: Desktop;
}

interface Desktop {
    page: string;
    revisions: string;
    edit: string;
    talk: string;
}

interface Thumbnail {
    source: string;
    width: number;
    height: number;
}

interface Titles {
    canonical: string;
    normalized: string;
    display: string;
}

interface Namespace {
    id: number;
    text: string;
}

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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const article: string = interaction.options.getString("article", true);
        const cached: boolean = interaction.options.getBoolean("cached") ?? true;

        const result: WikipediaResponse | undefined = await this.wikipediaSearch(article);

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = this.utils.trimString(result.extract, 2048);
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

    private async wikipediaSearch(article: string): Promise<WikipediaResponse | undefined> {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.replace(/\s/g, "_"))}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response) => response.json());

            return response;
        } catch (error) {
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "No results found for the provided search.",
                context: { article },
            });
        }
    }
}
