import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomInspirationalQuoteResponse {
    quoteText: string;
    quoteAuthor?: string;
    senderName?: string;
    senderLink?: string;
    quoteLink?: string;
}

export class InspirationalQuoteCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random inspirational quote.",
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

        const result: RandomInspirationalQuoteResponse | undefined = await this.getRandomInspirationalQuote();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No inspirational quotes were found, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            embeds: [new ImperiaEmbedBuilder().isSuccessEmbed().setImage(result.quoteText)],
        });
    }

    private async getRandomInspirationalQuote(): Promise<RandomInspirationalQuoteResponse | undefined> {
        const cacheKey = "random_inspirational_quotes";
        const url = "http://api.forismatic.com/api/1.0/";
        const params = new URLSearchParams({
            method: "getQuote",
            format: "json",
            lang: "en",
        });

        try {
            const response = (await fetch(`${url}?${params}`, {
                method: "GET",
                headers: {
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response: Response) => response.json())) as RandomInspirationalQuoteResponse;

            if (response.quoteAuthor) response.quoteText += `\n\n- ${response.quoteAuthor}`;

            await this.container.df.sadd(cacheKey, response.quoteText);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: string | null = await this.container.df.srandmember(cacheKey);
            if (cached) return { quoteText: cached };

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "An error occurred while fetching the inspirational quote, please try again later.",
            });
        }
    }
}
