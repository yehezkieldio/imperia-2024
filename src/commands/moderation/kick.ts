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
    type User,
    bold,
} from "discord.js";

export class KickCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Kick a user from the server.",
            requiredClientPermissions: ["SendMessages", "KickMembers"],
            requiredUserPermissions: ["KickMembers"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to kick from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for kicking the user from the server.")
                    .setRequired(false),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User = interaction.options.getUser("user", true);
        const reason: string = interaction.options.getString("reason") ?? "No reason provided.";

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
                embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription("You cannot kick yourself.")],
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription("I cannot kick myself.")],
            });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription("I cannot kick the server owner.")],
            });
        }

        if (
            member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
            member.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
            return interaction.reply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isErrorEmbed()
                        .setDescription("You cannot kick a user with the Kick Members or Administrator permission."),
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
                            .setDescription("You cannot kick a user with a higher or equal role position."),
                    ],
                });
            }
        }

        if (member.kickable) {
            await member.kick();

            member.send({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        `You have been kicked from ${bold(interaction.guild.name)} for the following reason: ${reason}`,
                    ),
                ],
            });

            return interaction.reply({
                embeds: [
                    new ImperiaEmbedBuilder().isSuccessEmbed().setDescription(`Successfully kicked ${bold(user.tag)}.`),
                ],
            });
        }

        return interaction.reply({
            embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription(`Unable to kick ${bold(user.tag)}.`)],
        });
    }
}
