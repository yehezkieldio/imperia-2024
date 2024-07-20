import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { UserError } from "@sapphire/framework";
import { type Guild, type InteractionResponse, SlashCommandBuilder } from "discord.js";

export class ServerAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View the avatar of a server.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const server: Guild = interaction.guild;

        const serverAvatar = server.iconURL({ size: 4096 }) ?? "";

        if (!serverAvatar) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().setDescription("This server does not have an avatar.")],
                ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            });
        }

        return interaction.reply({
            embeds: [
                new ImperiaEmbedBuilder()
                    .setAuthor({ name: `${server.name}'s avatar`, iconURL: serverAvatar })
                    .setImage(serverAvatar),
            ],
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }
}