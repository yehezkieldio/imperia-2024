import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import type { GitHubRepositoryQueryResult } from "@/internal/types/github";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { type APIEmbedField, SlashCommandBuilder } from "discord.js";

export class GithubCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Find information about a repository on GitHub.",
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
                    .setName("author")
                    .setDescription("The author of the repository to find information about.")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("repository")
                    .setDescription("The repository to find information about.")
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

        const author = interaction.options.getString("author", true);
        const repository = interaction.options.getString("repository", true);

        const result = await this.getRepository(author, repository);

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided fetch.")],
            });
        }

        const response = new ImperiaEmbedBuilder();

        response.setAuthor({
            name: `${result.owner.login} / ${result.name}`,
            iconURL: result.owner.avatar_url,
        });
        response.setDescription(result.description ?? "No description provided.");

        const fieldResponses: APIEmbedField[] = [
            {
                name: "Stargazers",
                value: result.stargazers_count.toString(),
                inline: true,
            },
            {
                name: "Forks",
                value: result.forks_count.toString(),
                inline: true,
            },
            {
                name: "Open Issues",
                value: result.open_issues_count.toString(),
                inline: true,
            },
            {
                name: "Watchers",
                value: result.watchers_count.toString(),
                inline: true,
            },
            {
                name: "Created At",
                value: new Date(result.created_at).toLocaleString(),
                inline: true,
            },
            {
                name: "Updated At",
                value: new Date(result.updated_at).toLocaleString(),
                inline: true,
            },
        ];
        response.addFields(fieldResponses);

        return interaction.editReply({ embeds: [response] });
    }

    private async getRepository(author: string, repository: string): Promise<GitHubRepositoryQueryResult | undefined> {
        const url = `https://api.github.com/repos/${author}/${repository}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                },
            }).then((response) => response.json());

            return response;
        } catch (error) {
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.SearchResultsNotFound,
                message: "No results found for the provided fetch.",
                context: { author, repository },
            });
        }
    }
}
