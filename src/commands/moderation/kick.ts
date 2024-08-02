import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import {
    type GuildMember,
    type GuildMemberRoleManager,
    type InteractionResponse,
    type Message,
    PermissionsBitField,
    SlashCommandBuilder,
    type User,
} from "discord.js";

export class KickCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Kick a user from the server.",
            tags: ["moderation"],
            requiredClientPermissions: ["KickMembers"],
            requiredUserPermissions: ["KickMembers"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
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

        void registry.registerChatInputCommand(command);
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

        if (user.id === interaction.user.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick yourself.",
            });
        }

        if (user.id === interaction.client.user.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick me.",
            });
        }

        if (user.id === interaction.guild?.ownerId) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick the server owner.",
            });
        }

        const member: GuildMember =
            interaction.guild.members.cache.get(user.id) ?? (await interaction.guild.members.fetch(user.id));

        if (
            member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
            member.permissions.has(PermissionsBitField.Flags.BanMembers)
        ) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick this user.",
            });
        }

        if (interaction.member) {
            if (
                (interaction.member.roles as GuildMemberRoleManager).highest.position <= member.roles.highest.position
            ) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: "( ノ・・)ノ You cannot kick this user.",
                });
            }
        }

        if (!member.kickable) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I cannot kick this user.",
            });
        }

        await member.kick(reason);

        member.send({
            embeds: [
                new ImperiaEmbedBuilder()
                    .setColorScheme("warning")
                    .setDescription(
                        `You have been kicked from **${interaction.guild.name}** for the following reason: ${reason}`,
                    ),
            ],
        });

        return interaction.reply({
            content: `˖ ݁𖥔 ݁˖ Successfully kicked **${user.tag}** from the server.`,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const userArgument: ResultType<User> = await args.restResult("user");

        if (userArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any user to kick, how am I supposed to do that?",
            });
        }

        const reasonArgument: ResultType<string> = await args.restResult("string");

        if (reasonArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any reason for kicking the user.",
            });
        }

        const user: User = userArgument.unwrap();
        const reason: string = reasonArgument.unwrap();

        if (!message.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        if (user.id === message.author.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick yourself.",
            });
        }

        if (user.id === message.client.user.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick me.",
            });
        }

        if (user.id === message.guild.ownerId) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick the server owner.",
            });
        }

        const member: GuildMember =
            message.guild.members.cache.get(user.id) ?? (await message.guild.members.fetch(user.id));

        if (
            member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
            member.permissions.has(PermissionsBitField.Flags.BanMembers)
        ) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ You cannot kick this user.",
            });
        }

        if (message.member) {
            if ((message.member.roles as GuildMemberRoleManager).highest.position <= member.roles.highest.position) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: "( ノ・・)ノ You cannot kick this user.",
                });
            }
        }

        if (!member.kickable) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I cannot kick this user.",
            });
        }

        await member.kick(reason);

        member.send({
            embeds: [
                new ImperiaEmbedBuilder()
                    .setColorScheme("warning")
                    .setDescription(
                        `You have been kicked from **${message.guild.name}** for the following reason: ${reason}`,
                    ),
            ],
        });

        return message.reply({
            content: `˖ ݁𖥔 ݁˖ Successfully kicked **${user.tag}** from the server.`,
        });
    }
}
