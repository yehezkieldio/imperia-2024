import { UserAgreementStatus } from "@/interaction-handlers/user-agreement";
import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Time, TimerManager } from "@sapphire/time-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, SlashCommandBuilder } from "discord.js";

export class RegisterUserCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Register yourself as a user in the database of the bot.",
            aliases: ["registeruser", "register"],
            tags: ["user"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<undefined | Message> {
        await interaction.deferReply({
            ephemeral: true,
        });

        const user = await this.container.repos.user.findOne(interaction.user.id);
        if (user?.length === 1) {
            return interaction.editReply({
                content: "（￢з￢） You are already registered!",
            });
        }

        const { embed, components } = this.generateAgreement(interaction.user.id);

        interaction.editReply({
            embeds: [embed],
            components: [components],
        });

        TimerManager.setTimeout((): void => {
            interaction.editReply({
                content: "Sorry (◞‸◟ㆀ)! You took too long to respond, please run the command again.",
                embeds: [],
                components: [],
            });
        }, Time.Second * 60);
    }

    public async messageRun(message: Message): Promise<void> {
        const registerCommand: string = this.container.utilities.toolbox.getCommandMention("register");

        const msg: Message = await message.reply(`Please use ${registerCommand} slash command to create an account!`);

        TimerManager.setTimeout((): void => {
            if (msg.deletable) msg.delete();
        }, Time.Second * 5);
    }

    private getAgreementText() {
        return {
            title: "Welcome to Imperia! ＼(-o- )",
            description:
                "Imperia will be collecting data from you to create your account, please review the agreement below.",
            fields: [
                {
                    name: "— Data Collection and Usage",
                    value: "Imperia gathers various Discord-related identifiers and stores content provided by users to deliver its functionalities. This information is solely used to enable the intended features of Imperia and is not utilized for any other purposes.",
                },
            ],
            footer: {
                text: "Click the buttons below to decide whether you agree or decline the agreement.",
            },
        };
    }

    private generateAgreement(userId: string) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("primary");
        const agreementText = this.getAgreementText();

        embed.setTitle(agreementText.title);
        embed.setDescription(agreementText.description);
        embed.setFields(agreementText.fields);
        embed.setFooter(agreementText.footer);

        const components: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();

        components.addComponents(
            new ButtonBuilder()
                .setCustomId(`register-${userId}-${UserAgreementStatus.CONFIRMED}`)
                .setLabel("Agree")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`register-${userId}-${UserAgreementStatus.DECLINED}`)
                .setLabel("Decline")
                .setStyle(ButtonStyle.Danger),
        );

        return {
            embed,
            components,
        };
    }
}
