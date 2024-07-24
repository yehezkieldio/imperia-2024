import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { type Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type GuildMember, type InteractionResponse, type Message, SlashCommandBuilder, type User } from "discord.js";

export class UserAvatarCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View your own or another user's avatar.",
            aliases: ["useravatar", "avatar", "av", "pfp"],
            tags: ["utility", "user"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to view the avatar of.").setRequired(false),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User = interaction.options.getUser("user") ?? interaction.user;
        const member: GuildMember | undefined =
            interaction.guild?.members.cache.get(user.id) ?? (await interaction.guild?.members.fetch(user.id));

        const embed: ImperiaEmbedBuilder = this.generateResponse(user, member);

        return interaction.reply({
            embeds: [embed],
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const user: User = await args.pick("user").catch(() => message.author);
        const member: GuildMember | undefined =
            message.guild?.members.cache.get(user.id) ?? (await message.guild?.members.fetch(user.id));

        const embed: ImperiaEmbedBuilder = this.generateResponse(user, member);

        return message.reply({
            embeds: [embed],
        });
    }

    private getAvatar(user: User, member?: GuildMember): string {
        const userAvatar: string = user.displayAvatarURL({ size: 4096 });

        if (!member) return userAvatar;
        const memberAvatar: string = member.displayAvatarURL({ size: 4096 });

        return userAvatar !== memberAvatar ? memberAvatar : userAvatar;
    }

    private generateResponse(user: User, member: GuildMember | undefined): ImperiaEmbedBuilder {
        const avatar: string = this.getAvatar(user, member);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isInformationEmbed();

        embed.setAuthor({
            name: member?.displayName ?? user.username,
            iconURL: avatar,
        });
        embed.setImage(avatar);

        return embed;
    }
}
