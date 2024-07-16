import { db } from "@/internal/database/connection";
import { ticTacToeGames } from "@/internal/database/schema";
import { updateComponent } from "@/internal/utils/component-utils";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
    type ActionRowBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";

interface ParsedData {
    gameType: string;
    buttonClicked: string;
    userId: string;
    opponentId: string;
    win: boolean;
}

export class TicTacToeGameHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "tictactoe-game-handler",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public boardMatrix: string[][] = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
    ];

    public async parse(interaction: ButtonInteraction) {
        if (!interaction.customId.startsWith("tictactoe")) return this.none();
        const parts = interaction.customId.split("_");

        const gameType = parts[0];
        const buttonClicked = parts[1];
        const userId = parts[2];
        const opponentId = parts[3];

        let gameState: {
            createdAt: Date;
            id: string;
            guildId: string;
            userId: string;
            opponentId: string;
            victorId: string | null;
            state: string;
            turn: "X" | "O";
            status: "IN_PROGRESS" | "WIN" | "DRAW";
            updatedAt: Date;
        };

        const [fetchGameState] = await db.select().from(ticTacToeGames).where(eq(ticTacToeGames.status, "IN_PROGRESS"));
        if (!fetchGameState) {
            const [createGameState] = await db
                .insert(ticTacToeGames)
                .values({
                    guildId: interaction.guildId as string,
                    userId: userId,
                    opponentId: opponentId,
                    state: JSON.stringify(this.boardMatrix),
                    turn: "X",
                    status: "IN_PROGRESS",
                })
                .returning();

            gameState = createGameState;
        }

        gameState = fetchGameState;

        if (interaction.user.id !== userId && interaction.user.id !== opponentId) {
            return this.none();
        }

        for (let i = 0; i < this.boardMatrix.length; i++) {
            for (let j = 0; j < this.boardMatrix[i].length; j++) {
                if (this.boardMatrix[i][j] === buttonClicked) {
                    this.boardMatrix[i][j] = interaction.user.id === userId ? "X" : "O";
                }
            }
        }

        if (this.checkWin(this.boardMatrix, interaction.user.id === userId ? "X" : "O")) {
            await db
                .update(ticTacToeGames)
                .set({ status: "WIN", victorId: interaction.user.id })
                .where(eq(ticTacToeGames.id, gameState.id));

            return this.some<ParsedData>({ gameType, buttonClicked, userId, opponentId, win: true });
        }

        return this.some<ParsedData>({ gameType, buttonClicked, userId, opponentId, win: false });
    }

    public async run(interaction: ButtonInteraction, data?: ParsedData) {
        if (!data) return;

        if (data.win) {
            this.boardMatrix = [
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
            ];

            return interaction.update({
                content: `Player ${interaction.user.id} wins!`,
                components: [],
            });
        }

        let buttons: ActionRowBuilder<MessageActionRowComponentBuilder>[];

        if (interaction.component.style === ButtonStyle.Danger || interaction.component.style === ButtonStyle.Primary) {
            return await interaction.reply({
                content: "Already clicked!",
                ephemeral: true,
            });
        }

        if (interaction.user.id === data.userId) {
            buttons = updateComponent(interaction, (button) => button.setStyle(ButtonStyle.Primary).setLabel("X"));
        } else {
            buttons = updateComponent(interaction, (button) => button.setStyle(ButtonStyle.Danger).setLabel("O"));
        }

        await interaction.update({
            components: buttons,
        });
    }

    private checkWin(board: string[][], player: string) {
        // horizontal
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
                return true;
            }
        }

        // vertical
        for (let i = 0; i < 3; i++) {
            if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
                return true;
            }
        }

        // diagonal
        if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
            return true;
        }

        if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
            return true;
        }

        return false;
    }
}
