import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import * as phonton from "@silvia-odwyer/photon-node";
import { AttachmentBuilder, type Message, SlashCommandBuilder, type User } from "discord.js";

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
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const user: User = interaction.options.getUser("user") ?? interaction.user;

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const userAvatar: string = user.displayAvatarURL({ size: 4096 });

        const imageToBase64 = async (url: string) => {
            const response = await fetch(url);
            return response.arrayBuffer();
        };

        const phtn_image: phonton.PhotonImage = phonton.PhotonImage.new_from_base64(
            Buffer.from(await imageToBase64(userAvatar)).toString("base64"),
        );

        phonton.grayscale(phtn_image);

        const output: Uint8Array = phtn_image.get_bytes();
        const buffer_output: Buffer = Buffer.from(output);
        const avatar = new AttachmentBuilder(buffer_output, {
            name: `${user.id}_grayscale.png`,
        });

        return interaction.editReply({
            files: [avatar],
        });
    }
}
