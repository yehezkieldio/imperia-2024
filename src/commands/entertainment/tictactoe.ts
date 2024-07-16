import { ImperiaCommand } from "@/internal/extensions/command";
import { RegisterBehavior } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, type User } from "discord.js";

export class TicTacToeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Play a game of Tic Tac Toe.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("opponent").setDescription("The user you want to play against.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const opponent: User = interaction.options.getUser("opponent", true);

        if (opponent.bot) {
            return interaction.reply({
                content: "You cannot play against a bot!",
                ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
            });
        }

        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: "You cannot play against yourself!",
                ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
            });
        }

        if (interaction.guild?.members.cache.get(opponent.id)?.presence?.status === "offline") {
            return interaction.reply({
                content: "The user you are trying to play against is offline!",
                ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
            });
        }

        await interaction.deferReply();

        await interaction.editReply({
            content: "Please wait while the game is being set up...",
        });

        const boardButtonsRowOne = new ActionRowBuilder<ButtonBuilder>().addComponents(
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

        const boardButtonsRowTwo = new ActionRowBuilder<ButtonBuilder>().addComponents(
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

        const boardButtonsRowThree = new ActionRowBuilder<ButtonBuilder>().addComponents(
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

        return interaction.editReply({
            components: [boardButtonsRowOne, boardButtonsRowTwo, boardButtonsRowThree],
        });
    }
}
