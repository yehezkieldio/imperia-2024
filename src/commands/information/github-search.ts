import type { GitHubRepositoryResponse } from "@/commands/information/github";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type APIEmbedField, type Message, SlashCommandBuilder } from "discord.js";

interface GitHubRepositoriesSearchResponse {
    total_count: number;
    incomplete_results: boolean;
    items: GitHubRepositoryResponse[];
}

export class GithubCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Find information about a repository on GitHub without specifying the owner.",
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
                    .setName("repository")
                    .setDescription("The repository to find information about.")
                    .setRequired(true),
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

        const repository: string = interaction.options.getString("repository", true);
        const cached: boolean = interaction.options.getBoolean("cached") ?? true;

        const result: GitHubRepositoryResponse | undefined = await this.getRepository(repository, cached);

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

    private async getRepository(repository: string, cached = true): Promise<GitHubRepositoryResponse | undefined> {
        /**
         * TODO: Should implement a alternate cache solution while taking into account the other github command, and it's search index.
         */
        const cache_key: string = `github_repo_${repository.toLowerCase()}`;
        const url = `https://api.github.com/search/repositories?q=${repository}+in:name&sort=stars&order=desc`;

        if (cached) {
            const cached: string | null = await this.container.df.hget(cache_key, "data");
            if (cached) {
                return JSON.parse(cached);
            }
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                },
            }).then((response) => response.json());

            await this.container.df.hset(cache_key, {
                search: repository.toLowerCase(),
                data: JSON.stringify(response),
            });
            await this.container.df.expire(cache_key, 3600);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: string | null = await this.container.df.hget(cache_key, "data");
            if (cached) {
                return JSON.parse(cached);
            }

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "No results found for the provided fetch.",
                context: { repository },
            });
        }
    }
}
