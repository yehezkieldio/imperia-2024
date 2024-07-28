import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

export enum UserAgreementStatus {
    CONFIRMED = "confirmed",
    DECLINED = "declined",
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
        if (!interaction.customId.startsWith("register")) {
            return this.none();
        }

        const [_, userId, status] = interaction.customId.split("-");
        const currentStatus = status as UserAgreementStatus;

        if (currentStatus === UserAgreementStatus.CONFIRMED) {
            return this.some({ userId, status: UserAgreementStatus.CONFIRMED });
        }

        if (currentStatus === UserAgreementStatus.DECLINED) {
            return this.some({ userId, status: UserAgreementStatus.DECLINED });
        }

        return this.none();
    }

    public async run(interaction: ButtonInteraction, data?: InteractionHandler.ParseResult<this>) {
        if (!data) return;

        await interaction.update({
            components: [],
        });

        if (data.status === UserAgreementStatus.DECLINED) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .setDescription(
                            "You have declined Imperia's user agreement, and have not been registered. Some features may not be available to you, should you change your mind, you can re-run the register command.",
                        )
                        .setColorScheme("error"),
                ],
            });
        }

        const user = await this.container.repos.user.create(data.userId);
        if (!user) {
            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .setDescription(
                            "An error occurred while registering you as a user. Please try again later or contact the developers for assistance.",
                        )
                        .setColorScheme("error"),
                ],
            });
        }

        return interaction.editReply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    "You have agreed to Imperia's user agreement and have been registered! Welcome and enjoy your stay~ (^_^;)",
                ),
            ],
        });
    }
}
