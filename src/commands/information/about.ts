import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type InteractionResponse,
    SlashCommandBuilder,
    type User,
} from "discord.js";

export class AboutCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "See information about the bot.",
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
        const helpCommand: string = this.utils.getCommandMention("help");
        const registerCommand: string = this.utils.getCommandMention("register");

        const links: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel("Invite")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.com/oauth2/authorize?client_id=911590809873301514"),
            new ButtonBuilder()
                .setLabel("GitHub")
                .setStyle(ButtonStyle.Link)
                .setURL("https://github.com/i9ntheory/imperia"),
        );

        const user: User = this.container.client.user as User;

        return interaction.reply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            embeds: [
                new ImperiaEmbedBuilder()
                    .setAuthor({
                        name: `${user.username}`,
                        iconURL: user.displayAvatarURL(),
                    })
                    .setDescription(
                        `~Hi-ya! I'm Imperia! All-in-one Discord bot featuring a plethora of tools for moderation, entertainment, productivity, and community engagement. \n\nMy feature set is still in it's early stages, but it includes performing tasks such as server administration, effortless moderation with automated systems, various entertainment options, and more!`,
                    )
                    .addFields({
                        name: "— Getting Started",
                        value: `Imperia is designed to be user-friendly and easy to use. The ${helpCommand} command will provide you with a list of available commands and their descriptions. If you're new, use the ${registerCommand} command to unlock my full potential and access to all my features.`,
                    })
                    .setFooter({
                        text: "A project by @elizielx",
                    }),
            ],
            components: [links],
        });
    }
}
