import { RESPONSE_PRIVACY_ID } from "@/internal/constants/ids";
import { db } from "@/internal/database/connection";
import { users } from "@/internal/database/schema";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ResponsePrivacyStatus } from "@/internal/types/enums";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";

interface ParsedData {
    userId: string;
    status: ResponsePrivacyStatus;
}

export class ResponsePrivacySettingHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "response-privacy-setting-handler",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public parse(interaction: ButtonInteraction) {
        if (!interaction.customId.startsWith(RESPONSE_PRIVACY_ID)) {
            return this.none();
        }

        const [_, userId, status] = interaction.customId.split("-");
        const currentStatus = status as ResponsePrivacyStatus;

        if (currentStatus === ResponsePrivacyStatus.PUBLIC) {
            return this.some<ParsedData>({ userId, status: ResponsePrivacyStatus.PUBLIC });
        }

        if (currentStatus === ResponsePrivacyStatus.PRIVATE) {
            return this.some<ParsedData>({ userId, status: ResponsePrivacyStatus.PRIVATE });
        }

        return this.none();
    }

    public async run(interaction: ButtonInteraction, data?: ParsedData) {
        if (!data) return;

        await interaction.update({
            components: [],
        });

        if (data.status === ResponsePrivacyStatus.PUBLIC) {
            const [result] = await db
                .update(users)
                .set({
                    responsePrivacy: false,
                })
                .where(eq(users.discordId, data.userId))
                .returning();

            if (!result) {
                return interaction.editReply({
                    embeds: [
                        new ImperiaEmbedBuilder().setDescription(
                            "An error occurred while updating your response privacy setting. Please try again later.",
                        ),
                    ],
                });
            }

            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        "Your response privacy setting has been updated to public. Imperia will now respond to your commands in messages visible to everyone in the channel.",
                    ),
                ],
            });
        }

        const [result] = await db
            .update(users)
            .set({
                responsePrivacy: true,
            })
            .where(eq(users.discordId, data.userId))
            .returning();

        if (!result) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        "An error occurred while updating your response privacy setting. Please try again later.",
                    ),
                ],
            });
        }

        return interaction.editReply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    "Your response privacy setting has been updated to private. Imperia will now respond to your commands in ephemeral messages, only visible to you.",
                ),
            ],
        });
    }
}
