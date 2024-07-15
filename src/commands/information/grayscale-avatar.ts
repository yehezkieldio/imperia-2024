import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { RegisterBehavior, UserError } from "@sapphire/framework";
import * as phonton from "@silvia-odwyer/photon-node";
import { AttachmentBuilder, type GuildMember, SlashCommandBuilder } from "discord.js";

export class GrayscaleAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View a black and white version of a user's avatar.",
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

        const userAvatar = user.displayAvatarURL({ size: 4096 });
        const memberAvatar = member.displayAvatarURL({ size: 4096 });

        const imageToBase64 = async (url: string) => {
            const response = await fetch(url);
            return response.arrayBuffer();
        };

        const phtn_image = phonton.PhotonImage.new_from_base64(
            Buffer.from(await imageToBase64(userAvatar)).toString("base64"),
        );

        phonton.grayscale(phtn_image);

        const output = phtn_image.get_bytes();
        const buffer_output = Buffer.from(output);
        const avatar = new AttachmentBuilder(buffer_output, {
            name: "grayscale.png",
        });

        return interaction.reply({
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
            files: [avatar],
        });
    }
}
