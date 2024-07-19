import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { type GuildMember, type InteractionResponse, SlashCommandBuilder, type User } from "discord.js";

export class AvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View the avatar of a user.",
            requiredClientPermissions: ["SendMessages"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("View the avatar of a user. Defaults to the command user if no user is provided."),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User = interaction.options.getUser("user") ?? interaction.user;

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const member: GuildMember =
            interaction.guild.members.cache.get(user.id) ?? (await interaction.guild.members.fetch(user.id));

        const userAvatar: string = user.displayAvatarURL({ size: 4096 });
        const memberAvatar: string = member.displayAvatarURL({ size: 4096 });

        const avatars: ImperiaEmbedBuilder[] =
            userAvatar !== memberAvatar
                ? [
                      new ImperiaEmbedBuilder()
                          .setAuthor({ name: `${user.username}'s avatar`, iconURL: userAvatar })
                          .setImage(userAvatar),
                      new ImperiaEmbedBuilder().setImage(memberAvatar),
                  ]
                : [
                      new ImperiaEmbedBuilder()
                          .setAuthor({ name: `${user.username}'s avatar`, iconURL: userAvatar })
                          .setImage(userAvatar),
                  ];

        return interaction.reply({
            embeds: avatars,
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }
}
