import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import type { DragonflySearchResult } from "@/internal/typings/dragonfly";
import { UserError } from "@sapphire/framework";
import { type APIEmbedField, type Message, SlashCommandBuilder } from "discord.js";

export interface GitHubRepositoryResponse {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: Owner;
    html_url: string;
    description: string;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    subscription_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    git_url: string;
    ssh_url: string;
    clone_url: string;
    svn_url: string;
    homepage: string;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    mirror_url: null;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: string;
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
    temp_clone_token: null;
    network_count: number;
    subscribers_count: number;
}

interface Owner {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

export class GithubCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Find information about a repository on GitHub.",
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
                    .setName("author")
                    .setDescription("The author of the repository to find information about.")
                    .setRequired(true),
            )
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

        const author: string = interaction.options.getString("author", true);
        const repository: string = interaction.options.getString("repository", true);
        const cached: boolean = interaction.options.getBoolean("cached") ?? true;

        const result: GitHubRepositoryResponse | undefined = await this.getRepository(author, repository, cached);

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

    private async getRepository(
        author: string,
        repository: string,
        cached = true,
    ): Promise<GitHubRepositoryResponse | undefined> {
        if (cached) {
            const cachedResult = await this.getCachedData(repository, author);
            if (cachedResult) {
                return cachedResult;
            }
        }

        const url = `https://api.github.com/repos/${author}/${repository}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                },
            }).then((response) => response.json());

            await this.setCachedData(repository, author, response);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: GitHubRepositoryResponse | null = await this.getCachedData(repository, author);
            if (cached) return cached;

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "No results found for the provided fetch.",
                context: { author, repository },
            });
        }
    }

    private async setCachedData(
        search: string,
        author: string,
        data: GitHubRepositoryResponse,
        ttl = 3600,
    ): Promise<void> {
        const key = `github_search_${this.utils.slugify(search)}_${this.utils.slugify(search)}`;
        await this.container.df.hset(key, {
            author,
            search: search.toLowerCase(),
            data: JSON.stringify(data),
        });
        await this.container.df.expire(key, ttl);
    }

    private async getCachedData(search: string, author: string): Promise<GitHubRepositoryResponse | null> {
        const query = `@author:{${author}} @search:(${search.toLowerCase()})`;
        const searchResults = (await this.container.df.call(
            "FT.SEARCH",
            "github_idx",
            query,
            "LIMIT",
            "0",
            "1",
        )) as DragonflySearchResult;

        if (searchResults[0] === 0) {
            return null;
        }

        return this.parseGitHubData(searchResults);
    }

    private parseGitHubData(array: DragonflySearchResult): GitHubRepositoryResponse {
        const [, , [, , , dataStr]] = array;
        const data: GitHubRepositoryResponse = JSON.parse(dataStr);

        return data;
    }
}
