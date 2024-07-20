import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import {
    type GuildMember,
    type GuildMemberRoleManager,
    type InteractionResponse,
    PermissionsBitField,
    SlashCommandBuilder,
    bold,
} from "discord.js";

export class BanCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Ban a user from the server.",
            requiredClientPermissions: ["SendMessages", "BanMembers"],
            requiredUserPermissions: ["BanMembers"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to ban from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for banning the user from the server.")
                    .setRequired(false),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const member: GuildMember =
            interaction.guild.members.cache.get(user.id) ?? (await interaction.guild.members.fetch(user.id));

        if (user.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription("You cannot ban yourself.")],
            });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription("I cannot ban the server owner.")],
            });
        }

        if (
            member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
            member.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
            return interaction.reply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("You cannot ban a user with the Ban Members or Administrator permission."),
                ],
            });
        }

        if (interaction.member) {
            if (
                (interaction.member.roles as GuildMemberRoleManager).highest.position <= member.roles.highest.position
            ) {
                return interaction.reply({
                    embeds: [
                        new ImperiaEmbedBuilder()
                            .isErrorEmbed()
                            .setDescription("You cannot ban a user with a higher or equal role position."),
                    ],
                });
            }
        }

        if (member.bannable) {
            await member.ban({ reason });

            member.send({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        `You have been banned from ${bold(interaction.guild.name)} for the following reason: ${reason}`,
                    ),
                ],
            });

            return interaction.reply({
                embeds: [
                    new ImperiaEmbedBuilder().isSuccessEmbed().setDescription(`Successfully banned ${bold(user.tag)}.`),
                ],
            });
        }

        return interaction.reply({
            embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription(`Unable to ban ${bold(user.tag)}.`)],
        });
    }
}
