import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Guild, type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class ServerAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View the avatar of the server.",
            aliases: ["serveravatar", "serverav", "serverpfp", "server-av", "server-pfp"],
            tags: ["utility", "server"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
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
        const server: Guild = interaction.guild as Guild;
        const embed: ImperiaEmbedBuilder = this.generateResponse(server);

        return interaction.reply({
            embeds: [embed],
            content: "｡ ｡ ゛(ﾉ><)ﾉ Here's the server avatar!",
        });
    }

    public async messageRun(message: Message): Promise<Message> {
        const server: Guild = message.guild as Guild;
        const embed: ImperiaEmbedBuilder = this.generateResponse(server);

        return message.reply({
            embeds: [embed],
            content: "｡ ｡ ゛(ﾉ><)ﾉ Here's the server avatar!",
        });
    }

    private getServerAvatar(server: Guild) {
        const serverAvatar: string | null = server.iconURL({ size: 4096 });
        if (!serverAvatar) return "";

        return serverAvatar;
    }

    private generateResponse(server: Guild) {
        const avatar: string = this.getServerAvatar(server);

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isInformationEmbed();

        if (avatar === "") {
            embed.setDescription("This server does not have an avatar! ~-_ʘᗜʘ_/~ ");

            return embed;
        }

        embed.setAuthor({
            name: server.name,
            iconURL: avatar,
        });
        embed.setImage(avatar);

        return embed;
    }
}
