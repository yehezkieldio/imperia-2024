import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { TimerManager } from "@sapphire/timer-manager";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, SlashCommandBuilder } from "discord.js";

export enum UserAgreementStatus {
    CONFIRMED = "confirmed",
    DECLINED = "declined",
}

export class RegisterCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Create a new account on Imperia.",
            tags: ["account"],
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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<void> {
        const { embed, components } = this.generateAgreement(interaction.user.id);

        interaction.reply({
            embeds: [embed],
            components: [components],
            ephemeral: true,
        });

        TimerManager.setTimeout((): void => {
            interaction.editReply({
                components: [],
            });
        }, Time.Second * 60);
    }

    public async messageRun(message: Message): Promise<void> {
        const registerCommand: string = this.container.utilities.toolbox.getCommandMention("register");

        const msg: Message = await message.reply(`Please use ${registerCommand} slash command to create an account.`);

        TimerManager.setTimeout((): void => {
            if (msg.deletable) msg.delete();
        }, Time.Second * 5);
    }

    private generateAgreement(userId: string) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();

        embed.setTitle("Welcome to Imperia!");
        embed.setDescription(
            "Imperia will be collecting data from you to create your account, please review the agreement below.",
        );

        embed.setFields([
            {
                name: "— Data Collection and Usage",
                value: "Imperia gathers various Discord-related identifiers and stores content provided by users to deliver its functionalities. This information is solely used to enable the intended features of Imperia and is not utilized for any other purposes.",
            },
        ]);

        embed.setFooter({
            text: "Click the buttons below to decide whether you agree or decline the agreement.",
        });

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
