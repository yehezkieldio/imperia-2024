import { USER_AGREEMENT_ID } from "@/internal/constants/ids";
import { db } from "@/internal/database/connection";
import { users } from "@/internal/database/schema";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { UserAgreementStatus } from "@/internal/types/enums";
import { RegisterBehavior } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

export class RegisterCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Register and sync your data with the bot.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: true,
        });

        const [result] = await db.select().from(users).where(eq(users.discordId, interaction.user.id));
        if (!result) {
            const actionButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${USER_AGREEMENT_ID}-${interaction.user.id}-${UserAgreementStatus.CONFIRMED}`)
                    .setLabel("Agree")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`${USER_AGREEMENT_ID}-${interaction.user.id}-${UserAgreementStatus.CANCELLED}`)
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger),
            );

            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .setDescription(
                            "Imperia will be collecting data from you to sync your account with our database. Please review our user agreement before proceeding.",
                        )
                        .setFields([
                            {
                                name: "— Use At Your Own Risk",
                                value: "Imperia is provided as is; without any warranties, express or implied. You use Imperia at your own risk.\n\nThe developers of Imperia do not guarantee the accuracy, reliability, or suitability of the bot for any particular purpose. We are not responsible for any direct, indirect, incidental, or consequential damages arising from the use or inability to use Imperia.",
                            },
                            {
                                name: "— Data Collection",
                                value: "Imperia collects various Discord-related identifiers, including User IDs, Server IDs, Channel IDs, Role IDs, and Message IDs for the purpose of providing its functionalities.\n\nImperia may also collect and store content provided by users for interaction or configuration purposes. This content includes but is not limited to command inputs, configurations, and customizations. We do not use this information for any purpose other than delivering the intended features of the bot.\n\nBy clicking the agree button below, you agree to our user agreement.",
                            },
                        ]),
                ],
                components: [actionButtons],
            });
        }

        return interaction.editReply({
            content: "You are already registered.",
        });
    }
}
