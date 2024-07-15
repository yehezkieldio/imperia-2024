import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import { type GuildMember, SlashCommandBuilder, bold, hyperlink } from "discord.js";

export class ReverseAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Reverse search your avatar or the avatar of another user.",
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
                    .setDescription(
                        "Reverse search the avatar of a user. Defaults to the command user if no user is provided.",
                    ),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") ?? interaction.user;

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const member: GuildMember =
            interaction.guild.members.cache.get(user.id) ?? (await interaction.guild.members.fetch(user.id));

        const userAvatar = user.displayAvatarURL({ size: 2048 });
        const memberAvatar = member.displayAvatarURL({ size: 2048 });

        const google = `https://lens.google.com/uploadbyurl?url=${
            userAvatar !== memberAvatar ? memberAvatar : userAvatar
        }`;
        const bing = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:${
            userAvatar !== memberAvatar ? memberAvatar : userAvatar
        }`;
        const tineye = `https://www.tineye.com/search/?url=${userAvatar !== memberAvatar ? memberAvatar : userAvatar}`;

        return interaction.reply({
            embeds: [
                new ImperiaEmbedBuilder().setDescription(
                    `Reverse search for the avatar of ${bold(user.tag)}:
                    ${hyperlink("Google", google)} | ${hyperlink("Bing", bing)} | ${hyperlink("TinEye", tineye)}`,
                ),
            ],
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });
    }
}
