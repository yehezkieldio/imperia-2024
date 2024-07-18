import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

interface OwoifiedTextResponse {
    owo: string;
}

export class OwoifyCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Owoify a text.",
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
                option.setName("text").setDescription("The text to owoify.").setRequired(true),
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

        const words: string = interaction.options.getString("text", true);

        const result: OwoifiedTextResponse | undefined = await this.owoifyText(words);

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("No owoified text were found, please try again later."),
                ],
            });
        }

        return interaction.editReply({
            content: result.owo,
        });
    }

    private async owoifyText(words: string): Promise<OwoifiedTextResponse | undefined> {
        const url = `https://nekos.life/api/v2/owoify?text=${encodeURIComponent(words)}`;

        try {
            const response = (await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Imperia (https://github.com/i9ntheory/imperia)",
                    Accept: "application/json",
                },
            }).then((response: Response) => response.json())) as OwoifiedTextResponse;

            return response;
        } catch (error) {
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "An error occurred while fetching the owoified response, please try again later.",
            });
        }
    }
}
