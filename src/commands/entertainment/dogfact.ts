import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomDogFactResponse {
    facts: string[];
    success?: boolean;
}

export class DogFactCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random dog fact.",
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

        const result: RandomDogFactResponse | undefined = await this.getRandomDogFact();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No dog facts were found, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            embeds: [new ImperiaEmbedBuilder().isSuccessEmbed().setDescription(result.facts[0])],
        });
    }

    private async getRandomDogFact(): Promise<RandomDogFactResponse | undefined> {
        const cacheKey = "random_dog_facts";
        const url = "https://dog-api.kinduff.com/api/facts?number=1";

        try {
            const response = (await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response: Response) => response.json())) as RandomDogFactResponse;

            await this.container.df.sadd(cacheKey, response.facts[0]);

            return response;
        } catch (error) {
            this.container.logger.error(error);

            const cached: string | null = await this.container.df.srandmember(cacheKey);
            if (cached) return { facts: Array.of(cached) };

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "An error occurred while fetching the cat fact, please try again later.",
            });
        }
    }
}
