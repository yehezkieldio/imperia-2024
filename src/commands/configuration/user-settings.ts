import { RESPONSE_PRIVACY_ID } from "@/internal/constants/ids";
import { userOptionsObject } from "@/internal/constants/user-settings";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ResponsePrivacyStatus } from "@/internal/types/enums";
import { RegisterBehavior } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, bold } from "discord.js";

export class UserSettingsCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Configure your personal settings that affect the bot.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly", "RegisteredUserOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("setting")
                    .setDescription("The setting you want to configure.")
                    .setRequired(true)
                    .setAutocomplete(true),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });

        const setting: string = interaction.options.getString("setting", true);

        if (setting === userOptionsObject.responsePrivacy) {
            const actionButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${RESPONSE_PRIVACY_ID}-${interaction.user.id}-${ResponsePrivacyStatus.PUBLIC}`)
                    .setLabel("Public")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`${RESPONSE_PRIVACY_ID}-${interaction.user.id}-${ResponsePrivacyStatus.PRIVATE}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Private"),
            );

            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        `Select a privacy setting below to configure how Imperia responds to your commands.\n\n${bold("Public")}: Imperia will respond to your commands in without ephemeral messages, visible to everyone in the channel.\n${bold("Private")}: Imperia will respond to your commands in ephemeral messages, only visible to you.\n\nCurrent privacy setting: ${bold((await ImperiaCommand.isEphemeralResponse(interaction.user.id)) ? "Private" : "Public")}`,
                    ),
                ],
                components: [actionButtons],
            });
        }

        return interaction.reply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    "The setting you provided is not valid. Please try again with a valid setting.",
                ),
            ],
        });
    }
}
