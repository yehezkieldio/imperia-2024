import { USER_AGREEMENT_ID } from "@/internal/constants/ids";
import { db } from "@/internal/database/connection";
import { users } from "@/internal/database/schema";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { UserAgreementStatus } from "@/internal/types/enums";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

interface ParsedData {
    userId: string;
    status: UserAgreementStatus;
}

export class UserAgreementHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "user-agreement-handler",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public parse(interaction: ButtonInteraction) {
        this.container.logger.debug("UserAgreementHandler: Button Interaction", interaction);

        if (!interaction.customId.startsWith(USER_AGREEMENT_ID)) {
            return this.none();
        }

        const [_, userId, status] = interaction.customId.split("-");
        const currentStatus = status as UserAgreementStatus;

        if (currentStatus === UserAgreementStatus.CONFIRMED) {
            return this.some<ParsedData>({ userId, status: UserAgreementStatus.CONFIRMED });
        }

        if (currentStatus === UserAgreementStatus.CANCELLED) {
            return this.some<ParsedData>({ userId, status: UserAgreementStatus.CANCELLED });
        }

        return this.none();
    }

    public async run(interaction: ButtonInteraction, data?: ParsedData) {
        if (!data) return;

        await interaction.update({
            components: [],
        });

        if (data.status === UserAgreementStatus.CANCELLED) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        "You have declined Imperia's user agreement, and have not been registered. Some features may not be available to you, should you change your mind, you can re-run the register command.",
                    ),
                ],
            });
        }

        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                discordId: data.userId,
            });
        });

        return interaction.editReply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    "You have agreed to Imperia's user agreement and have been registered. Welcome and enjoy your stay!",
                ),
            ],
        });
    }
}
