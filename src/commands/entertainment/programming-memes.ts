import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import type { PullpushSearchQueryResult } from "@/internal/types/pullpush";
import {} from "@/internal/utils/string-utils";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class ProgrammingMemesCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random meme from r/ProgrammerHumor.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

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

        const result = await this.getDankMemeSubmissions();

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const randomIndex = Math.floor(Math.random() * 100);
        const randomMeme = result.data[randomIndex];

        const response = new ImperiaEmbedBuilder();

        if (randomMeme.url) {
            response.setImage(randomMeme.url);
        } else {
            response.setDescription("Can't find the suitable meme for you, try running the command again.");
        }

        return interaction.editReply({
            embeds: [response],
        });
    }

    private async getDankMemeSubmissions(): Promise<PullpushSearchQueryResult | undefined> {
        const url =
            "https://api.pullpush.io/reddit/submission/search?html_decode=True&subreddit=ProgrammerHumor&size=100&sort_type=score";

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
                identifier: ImperiaIdentifiers.SearchResultsNotFound,
                message: "No results found for the provided search.",
            });
        }
    }
}
