import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import type { PullpushResponse } from "@/internal/typings/pullpush";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomProgrammingMemeResponse {
    urls: string[];
}

export class ProgrammingMemeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random programming meme from r/ProgrammingHumor.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const result: RandomProgrammingMemeResponse | undefined = await this.getRandomProgrammingMeme();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No programming meme were found, please try again later."),
                ],
            });
        }

        const randomMeme: string = this.utils.randomizeArray(result.urls);

        if (!(await this.utils.isValidUrl(randomMeme))) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("The programming meme URL is invalid, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            embeds: [new ImperiaEmbedBuilder().isSuccessEmbed().setImage(randomMeme)],
        });
    }

    private async getRandomProgrammingMeme(): Promise<RandomProgrammingMemeResponse | undefined> {
        const cacheKey = "random_programming_memes";
        const sortTypes = ["score", "num_comments", "created_utc"];

        const randomSortType: string = this.utils.randomizeArray(sortTypes);

        const url = `https://api.pullpush.io/reddit/submission/search?html_decode=True&subreddit=dankmemes&size=100&sort_type=${randomSortType}`;

        const cached: string[] = await this.container.df.lrange(cacheKey, 0, -1);

        if (!cached.length) {
            try {
                const response = (await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                        Accept: "application/json",
                    },
                }).then((response: Response) => response.json())) as PullpushResponse;

                const urls: string[] = response.data.map((data) => data.url);

                await this.container.df.rpush(cacheKey, ...urls);
                await this.container.df.expire(cacheKey, 7200);

                return { urls };
            } catch (error) {
                this.container.logger.error(error);

                new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: "An error occurred while fetching the programming meme, please try again later.",
                });
            }
        }

        return {
            urls: cached,
        };
    }
}
