import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { Time } from "@sapphire/time-utilities";
import { TimerManager } from "@sapphire/timer-manager";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, bold } from "discord.js";

export enum ResponsePrivacyStatus {
    PUBLIC = "public",
    PRIVATE = "private",
}

export const userOptions = {
    responsePrivacy: "responsePrivacy",
};

export class UserSettingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Configure your personal settings for Imperia.",
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
                    .addChoices([{ name: "Response Privacy", value: "responsePrivacy" }]),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const setting: string = interaction.options.getString("setting", true);

        if (setting === userOptions.responsePrivacy) {
            const actionButtons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`response_privacy-${interaction.user.id}-${ResponsePrivacyStatus.PUBLIC}`)
                    .setLabel("Public")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`response_privacy-${interaction.user.id}-${ResponsePrivacyStatus.PRIVATE}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Private"),
            );

            TimerManager.setTimeout(async () => {
                interaction.editReply({
                    content:
                        "This option has been timed out, if you wish to configure your settings again, please run the command.",
                    components: [],
                });
            }, Time.Minute * 1);

            return interaction.editReply({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        `Select a privacy setting below to configure how Imperia responds to your commands.\n\n${bold("PUBLIC")}: Imperia will respond to your commands in without ephemeral messages, visible to everyone in the channel.\n${bold("PRIVATE")}: Imperia will respond to your commands in ephemeral messages, only visible to you.\n\nCurrent privacy setting: ${bold((await this.utils.responsePrivacy(interaction.user.id)) ? "Private" : "Public")}\n\nThis setting will only apply to slash commands.`,
                    ),
                ],
                components: [actionButtons],
            });
        }

        TimerManager.setTimeout(async () => {
            interaction.editReply({
                content: "It ",
                components: [],
            });
        }, Time.Minute * 1);

        interaction.reply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    "The setting you provided is not valid. Please try again with a valid setting.",
                ),
            ],
        });
    }
}
