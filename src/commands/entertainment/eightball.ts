import { ImperiaCommand } from "@/internal/extensions/command";
import { type Message, SlashCommandBuilder } from "discord.js";

interface RandomDogResponse {
    message: string;
    status?: string;
}

export class EightBallCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Ask the magic 8-ball a question.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("question")
                    .setDescription("The question you want to ask the magic 8-ball.")
                    .setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    private responses = [
        // affirmative answers
        [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes, definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
        ],

        // non-committal answers
        [
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
        ],

        // negative answers
        ["Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."],
    ];

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const question: string = interaction.options.getString("question", true);
        const questionWords: string[] = ["is", "will", "can", "should", "does", "do", "am", "are", "was", "were"];
        let affirmative = false;

        for (const word of questionWords) {
            if (question.toLowerCase().startsWith(word)) {
                affirmative = true;
                break;
            }
        }

        const response = this.responses[affirmative ? 0 : Math.floor(Math.random() * this.responses.length)];

        return interaction.editReply({
            content: `🎱 ${response[Math.floor(Math.random() * response.length)]}`,
        });
    }
}
