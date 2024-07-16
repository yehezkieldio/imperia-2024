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
    ordo: string;
    userId: string;
    opponentId: string;
    victorId: string;
    gameId: string;
    boardState: string[][];
    isWin: boolean;
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
        const [_, ordo, userId, opponentId] = interaction.customId.split("_");

        if (interaction.user.id !== userId && interaction.user.id !== opponentId) {
            await interaction.reply({
                content: "You are not part of this game!",
                ephemeral: true,
            });

            return this.none();
        }

        const gameState = await this.getGameState(interaction.guildId as string, userId, opponentId);
        const gameBoard: string[][] = JSON.parse(gameState.state);

        if (gameState.turn === "X" && interaction.user.id === opponentId) {
            await interaction.reply({
                content: "It's not your turn!",
                ephemeral: true,
            });

            return this.none();
        }

        if (gameState.turn === "O" && interaction.user.id === userId) {
            await interaction.reply({
                content: "It's not your turn!",
                ephemeral: true,
            });

            return this.none();
        }

        for (let i = 0; i < gameBoard.length; i++) {
            for (let j = 0; j < gameBoard[i].length; j++) {
                if (gameBoard[i][j] === ordo) {
                    gameBoard[i][j] = interaction.user.id === userId ? "X" : "O";
                }
            }
        }

        return this.some<ParsedData>({
            ordo,
            userId: gameState.userId,
            opponentId: gameState.opponentId,
            victorId: "",
            gameId: gameState.id,
            boardState: gameBoard,
            isWin: false,
        });
    }

    public async run(interaction: ButtonInteraction, data?: ParsedData) {
        if (!data) return;

        if (data.isWin) {
            await db.update(ticTacToeGames).set({
                victorId: interaction.user.id,
                state: JSON.stringify(data.boardState),
                status: "WIN",
            });

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
            buttons = updateComponent(interaction, (button) =>
                button.setStyle(ButtonStyle.Primary).setLabel("X").setDisabled(true),
            );
        } else {
            buttons = updateComponent(interaction, (button) =>
                button.setStyle(ButtonStyle.Danger).setLabel("O").setDisabled(true),
            );
        }

        await db.update(ticTacToeGames).set({
            state: JSON.stringify(data.boardState),
            turn: interaction.user.id === data.userId ? "O" : "X",
        });

        return await interaction.update({
            components: buttons,
        });
    }

    private async getGameState(guildId: string, userId: string, opponentId: string) {
        const [fetchGameState] = await db.select().from(ticTacToeGames).where(eq(ticTacToeGames.status, "IN_PROGRESS"));

        if (!fetchGameState) {
            const [createGameState] = await db
                .insert(ticTacToeGames)
                .values({
                    guildId: guildId,
                    userId: userId,
                    opponentId: opponentId,
                    state: JSON.stringify(this.boardMatrix),
                    turn: "X",
                    status: "IN_PROGRESS",
                })
                .returning();

            return createGameState;
        }

        return fetchGameState;
    }
}
