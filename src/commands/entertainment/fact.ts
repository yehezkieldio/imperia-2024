import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomFactResponse {
    fact: string;
}

export class FactCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random fact.",
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

        const result: RandomFactResponse | undefined = await this.getRandomFact();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No fact were found, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            embeds: [new ImperiaEmbedBuilder().isSuccessEmbed().setDescription(result.fact)],
        });
    }

    private async getRandomFact(): Promise<RandomFactResponse | undefined> {
        const cacheKey = "random_facts";
        const url = "https://nekos.life/api/v2/fact";

        try {
            const response = (await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response: Response) => response.json())) as RandomFactResponse;

            await this.container.df.sadd(cacheKey, response.fact);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: string | null = await this.container.df.srandmember(cacheKey);
            if (cached) return { fact: cached };

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "An error occurred while fetching the fact, please try again later.",
            });
        }
    }
}
