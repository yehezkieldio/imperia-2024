import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomYoMamaResponse {
    joke: string;
    category?: string;
}

export class YoMamaCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random yo mama joke.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
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

        const result: RandomYoMamaResponse | undefined = await this.getRandomYoMamaJoke();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No yo mama joke were found, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            embeds: [new ImperiaEmbedBuilder().isSuccessEmbed().setDescription(result.joke)],
        });
    }

    private async getRandomYoMamaJoke(): Promise<RandomYoMamaResponse | undefined> {
        const cacheKey = "random_yomama";
        const url = "https://www.yomama-jokes.com/api/v1/jokes/random";

        try {
            const response = (await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response: Response) => response.json())) as RandomYoMamaResponse;

            await this.container.df.sadd(cacheKey, response.joke);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: string | null = await this.container.df.srandmember(cacheKey);
            if (cached) return { joke: cached };

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "An error occurred while fetching the yo mama joke, please try again later.",
            });
        }
    }
}
