import { ImperiaCommand } from "@/internal/extensions/command";
import { type Message, SlashCommandBuilder } from "discord.js";

export class AestheticCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Convert your text to full-width, aesthetic text.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("text").setDescription("The text to convert to full-width.").setRequired(true),
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

        const words: string = interaction.options.getString("text", true);

        return interaction.editReply({
            content: this.toFullWidth(words),
        });
    }

    private toFullWidth(text: string): string {
        return text.replace(/[!-~]/g, (char: string): string => {
            const code: number = char.charCodeAt(0);
            return String.fromCharCode(code + 0xfee0);
        });
    }
}
