import { UserAgreementStatus } from "@/interaction-handlers/user-agreement";
import { users } from "@/lib/databases/postgres/schema";
import { ImperiaCommand } from "@/lib/extensions/commands/command";
import { ImperiaIdentifiers } from "@/lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { getCommandMention } from "@/lib/utils/command-utils";
import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { Time, TimerManager } from "@sapphire/time-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

export class RegisterCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Register your Discord account with the bot for additional features.",
            tags: ["utility", "user"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
        });

        await this.checkIfUserAlreadyRegistered(interaction.user.id);

        const { embeds, components } = this.generateAgreement(interaction.user.id);

        await interaction.editReply({
            embeds,
            components,
        });

        TimerManager.setTimeout(async (): Promise<void> => {
            await interaction.editReply({
                content: "You took too long to respond! Please try again.",
                embeds: [],
                components: [],
            });
        }, Time.Second * 30);
    }

    public async messageRun(message: Message): Promise<void> {
        const registerCommand: string = getCommandMention("register");
        const msg: Message = await message.reply(`Please use ${registerCommand} slash command to create an account!`);

        TimerManager.setTimeout((): void => {
            if (msg.deletable) msg.delete();
        }, Time.Second * 5);
    }

    private async checkIfUserAlreadyRegistered(userId: string) {
        const [user] = await this.container.database.select().from(users).where(eq(users.discordId, userId));

        if (user) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "You are already registered.",
            });
        }

        return true;
    }

    private generateAgreement(userId: string): {
        embeds: ImperiaEmbedBuilder[];
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder()
            .setTheme("info")
            .setTitle("Welcome to Imperia!")
            .setDescription(
                "Imperia will be collecting data from you to create your account, please review the agreement below.",
            )
            .setFields([
                {
                    name: "— Data Collection and Usage",
                    value: "Imperia gathers various Discord-related identifiers and stores content provided by users to deliver its functionalities. This information is solely used to enable the intended features of Imperia and is not utilized for any other purposes.",
                },
            ])
            .setFooter({
                text: "Click the buttons below to decide whether you agree or decline the agreement.",
            });

        const components: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
            embeds: [embed],
            components: [components],
        };
    }
}
