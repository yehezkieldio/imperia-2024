import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import type { RandomCatFactQueryResult } from "@/internal/types/facts";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import {} from "@/internal/utils/string-utils";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class CatfactCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Get a random cat fact.",
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

        const result = await this.getRandomCatFact();

        if (!result) {
            return interaction.editReply({
                embeds: [new ImperiaEmbedBuilder().setDescription("No results found for the provided search.")],
            });
        }

        const response = new ImperiaEmbedBuilder();

        response.setDescription(result.fact);

        return interaction.editReply({
            embeds: [response],
        });
    }

    private async getRandomCatFact(): Promise<RandomCatFactQueryResult | undefined> {
        const url = "https://catfact.ninja/fact";

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
