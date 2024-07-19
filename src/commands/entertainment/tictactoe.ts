import { ticTacToeGames } from "@/internal/database/postgres/schema";
import { ImperiaCommand } from "@/internal/extensions/command";
import { Time } from "@sapphire/time-utilities";
import { TimerManager } from "@sapphire/timer-manager";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type InteractionResponse,
    SlashCommandBuilder,
    type User,
} from "discord.js";
import { and, eq } from "drizzle-orm";

export class TicTacToeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Play a game of Tic Tac Toe.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("opponent").setDescription("The user you want to play against.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(
        interaction: ImperiaCommand.ChatInputCommandInteraction,
    ): Promise<InteractionResponse | undefined> {
        const opponent: User = interaction.options.getUser("opponent", true);

        if (opponent.bot) {
            return interaction.reply({
                content: "You cannot play against a bot!",
                ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            });
        }

        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: "You cannot play against yourself!",
                ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            });
        }

        await interaction.deferReply();

        await interaction.editReply({
            content: "Please wait while the game is being set up...",
        });

        const boardButtonsRowOne: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`tictactoe_1_${interaction.user.id}_${opponent.id}`)
                .setLabel("1")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`tictactoe_2_${interaction.user.id}_${opponent.id}`)
                .setLabel("2")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`tictactoe_3_${interaction.user.id}_${opponent.id}`)
                .setLabel("3")
                .setStyle(ButtonStyle.Secondary),
        );

        const boardButtonsRowTwo: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`tictactoe_4_${interaction.user.id}_${opponent.id}`)
                .setLabel("4")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`tictactoe_5_${interaction.user.id}_${opponent.id}`)
                .setLabel("5")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`tictactoe_6_${interaction.user.id}_${opponent.id}`)
                .setLabel("6")
                .setStyle(ButtonStyle.Secondary),
        );

        const boardButtonsRowThree: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`tictactoe_7_${interaction.user.id}_${opponent.id}`)
                    .setLabel("7")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`tictactoe_8_${interaction.user.id}_${opponent.id}`)
                    .setLabel("8")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`tictactoe_9_${interaction.user.id}_${opponent.id}`)
                    .setLabel("9")
                    .setStyle(ButtonStyle.Secondary),
            );

        TimerManager.setTimeout(async () => {
            interaction.editReply({
                content: "This game has timed out or ended.",
                components: [],
            });

            await this.container.db
                .update(ticTacToeGames)
                .set({
                    status: "TIMEOUT",
                })
                .where(
                    and(
                        eq(ticTacToeGames.status, "IN_PROGRESS"),
                        eq(ticTacToeGames.guildId, interaction.guildId as string),
                        eq(ticTacToeGames.userId, interaction.user.id),
                        eq(ticTacToeGames.opponentId, opponent.id),
                    ),
                );
        }, Time.Minute * 1);

        interaction.editReply({
            content: "The game has been set up and will end in 1 minute if no one responds.",
            components: [boardButtonsRowOne, boardButtonsRowTwo, boardButtonsRowThree],
        });
    }
}
