import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type GuildMember, type InteractionResponse, SlashCommandBuilder, type User, bold } from "discord.js";

export class UnbanCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Removes a user's ban from the server.",
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
                option.setName("user").setDescription("The user to unban from the server.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("reason")
                    .setDescription("The reason for unbanning the user from the server.")
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

        if (member.bannable) {
            await interaction.guild.bans.remove(user.id, reason);

            member.send({
                embeds: [
                    new ImperiaEmbedBuilder().setDescription(
                        `You have been unbanned from ${bold(
                            interaction.guild.name,
                        )} for the following reason: ${reason}`,
                    ),
                ],
            });

            return interaction.reply({
                embeds: [
                    new ImperiaEmbedBuilder()
                        .isSuccessEmbed()
                        .setDescription(`Successfully unbanned ${bold(user.tag)}.`),
                ],
            });
        }

        return interaction.reply({
            embeds: [new ImperiaEmbedBuilder().isErrorEmbed().setDescription(`Unable to unban ${bold(user.tag)}.`)],
        });
    }
}
