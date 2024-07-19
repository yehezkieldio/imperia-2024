import { ticTacToeGames } from "@/internal/database/postgres/schema";
import { disableAllComponent, updateComponent } from "@/internal/utils/component-utils";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
    type ActionRowBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import { and, eq } from "drizzle-orm";

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

    private initialBoard: string[][] = [
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

        const isWin: boolean = this.computeWin(gameBoard, interaction.user.id === userId ? "X" : "O");
        const isDraw: boolean = gameBoard.every((row) => row.every((cell) => cell === "X" || cell === "O"));

        if (isWin) {
            return this.some<ParsedData>({
                ordo,
                userId: gameState.userId,
                opponentId: gameState.opponentId,
                victorId: interaction.user.id,
                gameId: gameState.id,
                boardState: gameBoard,
                isWin: true,
            });
        }

        if (isDraw) {
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

        return this.some<ParsedData>({
            ordo,
            userId: gameState.userId,
            opponentId: gameState.opponentId,
            victorId: "-",
            gameId: gameState.id,
            boardState: gameBoard,
            isWin: false,
        });
    }

    public async run(interaction: ButtonInteraction, data?: ParsedData) {
        if (!data) return;

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

        await this.container.db
            .update(ticTacToeGames)
            .set({
                state: JSON.stringify(data.boardState),
                turn: interaction.user.id === data.userId ? "O" : "X",
            })
            .where(eq(ticTacToeGames.id, data.gameId));

        if (data.victorId === "") {
            await this.container.db
                .update(ticTacToeGames)
                .set({
                    victorId: "",
                    state: JSON.stringify(data.boardState),
                    status: "DRAW",
                })
                .where(eq(ticTacToeGames.id, data.gameId));

            await interaction.update({
                components: buttons,
            });

            const disableButtons = disableAllComponent(interaction);

            return interaction.update({
                content: "It's a draw!",
                components: [...disableButtons],
            });
        }

        if (data.isWin) {
            await this.container.db
                .update(ticTacToeGames)
                .set({
                    victorId: interaction.user.id,
                    state: JSON.stringify(data.boardState),
                    status: "WIN",
                })
                .where(eq(ticTacToeGames.id, data.gameId));

            const username: string = this.container.client.users.cache.get(interaction.user.id)?.username as string;

            await interaction.update({
                components: buttons,
            });

            const disableButtons = disableAllComponent(interaction);

            return await interaction.editReply({
                content: `Congratulations ${username} has won!`,
                components: [...disableButtons],
            });
        }

        return await interaction.update({
            content: `It's ${interaction.user.id === data.userId ? "O" : "X"}'s turn!`,
            components: buttons,
        });
    }

    private computeWin(state: string[][], player: string) {
        // horizontal
        for (let i = 0; i < state.length; i++) {
            if (state[i].every((cell) => cell === player)) {
                return true;
            }
        }

        // vertical
        for (let i = 0; i < state.length; i++) {
            if (state.every((row) => row[i] === player)) {
                return true;
            }
        }

        // diagonal
        if (state.every((row, i) => row[i] === player)) {
            return true;
        }
        if (state.every((row, i) => row[state.length - 1 - i] === player)) {
            return true;
        }

        return false;
    }

    public async getGameState(guildId: string, userId: string, opponentId: string) {
        const [fetchGameState] = await this.container.db
            .select()
            .from(ticTacToeGames)
            .where(
                and(
                    eq(ticTacToeGames.status, "IN_PROGRESS"),
                    eq(ticTacToeGames.guildId, guildId),
                    eq(ticTacToeGames.userId, userId),
                    eq(ticTacToeGames.opponentId, opponentId),
                ),
            );

        if (!fetchGameState) {
            const [createGameState] = await this.container.db
                .insert(ticTacToeGames)
                .values({
                    guildId: guildId,
                    userId: userId,
                    opponentId: opponentId,
                    state: JSON.stringify(this.initialBoard),
                    turn: "X",
                    status: "IN_PROGRESS",
                })
                .returning();

            return createGameState;
        }

        return fetchGameState;
    }
}