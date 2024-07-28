import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type Guild, type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class ServerAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "View the avatar of the server.",
            aliases: ["server-avatar", "serverav", "serverpfp"],
            tags: ["server", "image", "utility"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const server: Guild = interaction.guild as Guild;
        const { reply, embed } = this.generateResponse(server);

        return interaction.reply({ content: reply, embeds: [embed] });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const server: Guild = message.guild as Guild;
        const { reply, embed } = this.generateResponse(server);

        return message.reply({ content: reply, embeds: [embed] });
    }

    private getServerAvatar(server: Guild) {
        const serverAvatar: string | null = server.iconURL({ size: 4096 });
        if (!serverAvatar) return "";

        return serverAvatar;
    }

    private generateResponse(server: Guild) {
        const avatar: string = this.getServerAvatar(server);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");

        if (!avatar) {
            new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "˖ ݁𖥔 ݁˖ Unfortunately, this server doesn't have an avatar!",
            });
        }

        const reply = "˖ ݁𖥔 ݁˖ Here's the requested avatar~";

        embed.setImage(avatar);

        return {
            reply,
            embed,
        };
    }
}
