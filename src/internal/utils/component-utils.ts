import {
    ActionRowBuilder,
    type ButtonBuilder,
    type MessageActionRowComponentBuilder,
    type MessageComponentInteraction,
} from "discord.js";

export function updateComponent<T extends ButtonBuilder>(
    interaction: MessageComponentInteraction,
    newButtonFunc: (component: T) => T,
    customId = interaction.customId,
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    const indices = findComponent(interaction, customId);
    if (!indices) {
        return [];
    }

    const actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = interaction.message.components.map<
        ActionRowBuilder<MessageActionRowComponentBuilder>
    >((row) => ActionRowBuilder.from(row));
    newButtonFunc(actionRows[indices.actionRowIndex].components[indices.componentIndex] as T);

    return actionRows;
}

export function disableComponent(
    interaction: MessageComponentInteraction,
    customId = interaction.customId,
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    return updateComponent(interaction, (button) => button.setDisabled(true), customId);
}

export function findComponent(
    interaction: MessageComponentInteraction,
    customId: string,
): { actionRowIndex: number; componentIndex: number } | undefined {
    const actionRows = interaction.message.components;
    for (let actionRowIndex = 0; actionRowIndex < actionRows.length; ++actionRowIndex) {
        const actionRow = actionRows[actionRowIndex];

        for (let componentIndex = 0; componentIndex < actionRow.components.length; ++componentIndex) {
            if (actionRow.components[componentIndex].customId === customId) {
                return {
                    actionRowIndex,
                    componentIndex,
                };
            }
        }
    }
}

export function disableAllComponent<T extends ButtonBuilder>(
    interaction: MessageComponentInteraction,
    customId = interaction.customId,
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    const indices = findAllComponent(interaction, interaction.customId);
    if (!indices) {
        return [];
    }

    const actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = interaction.message.components.map<
        ActionRowBuilder<MessageActionRowComponentBuilder>
    >((row) => ActionRowBuilder.from(row));
    for (const index of indices) {
        actionRows[index.actionRowIndex].components[index.componentIndex].setDisabled(true);
    }

    return actionRows;
}

export function findAllComponent(
    interaction: MessageComponentInteraction,
    customId: string,
): { actionRowIndex: number; componentIndex: number }[] {
    const actionRows = interaction.message.components;
    const indices: { actionRowIndex: number; componentIndex: number }[] = [];
    for (let actionRowIndex = 0; actionRowIndex < actionRows.length; ++actionRowIndex) {
        const actionRow = actionRows[actionRowIndex];

        for (let componentIndex = 0; componentIndex < actionRow.components.length; ++componentIndex) {
            indices.push({
                actionRowIndex,
                componentIndex,
            });
        }
    }

    return indices;
}

export function getAllButtons(interaction: MessageComponentInteraction) {
    const buttonIds: (string | null)[][] = interaction.message.components.map((row) =>
        row.components.map((button) => button.customId),
    );

    return buttonIds.reduce((acc, val) => acc.concat(val), []);
}
