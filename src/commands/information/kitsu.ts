import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import type { KitsuQueryResult } from "@/internal/types/kitsu";
import { stripHtmlTags, trimString } from "@/internal/utils/string-utils";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class AnilistCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Search Kitsu for information about an anime or manga.",
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

        const result = await this.kitsuSearch(title, type as "anime" | "manga");

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const trimDescription = trimString(result.attributes.description, 2048);
        const description = stripHtmlTags(trimDescription);

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

    private async kitsuSearch(title: string, type: "anime" | "manga"): Promise<KitsuQueryResult | undefined> {
        const url = "https://kitsu.io/api/edge/";
        const search = encodeURIComponent(title);

        try {
            const response = await fetch(`${url}/${type}?filter[text]=${search}`);
            const data = await response.json();

            if (data.data.length === 0) {
                new UserError({
                    identifier: ImperiaIdentifiers.SearchResultsNotFound,
                    message: "No results found for the provided search.",
                    context: { search, type },
                });
            }

            return data.data[0];
        } catch (error) {
            new UserError({
                identifier: ImperiaIdentifiers.SearchResultsNotFound,
                message: "No results found for the provided search.",
                context: { search, type },
            });
        }
    }
}
