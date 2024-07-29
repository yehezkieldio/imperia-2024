import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class EightBallCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Ask the magic 8-ball a question.",
            aliases: ["8ball"],
            tags: ["fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("question")
                    .setDescription("The question you want to ask the magic 8-ball.")
                    .setRequired(true),
            );

        void registry.registerChatInputCommand(command);
    }

    #responses: string[][] = [
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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const question: string = interaction.options.getString("question", true);
        const response: string = this.getResponse(question);

        return interaction.reply({
            content: response,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const questionArgument: ResultType<string> = await args.restResult("string");

        if (questionArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any question, how am I supposed to do that?",
            });
        }

        const question: string = questionArgument.unwrap();
        const response: string = this.getResponse(question);

        return message.reply({
            content: response,
        });
    }

    private getResponse(question: string): string {
        const questionWords: string[] = ["is", "will", "can", "should", "does", "do", "am", "are", "was", "were"];
        let affirmative = false;

        for (const word of questionWords) {
            if (question.toLowerCase().startsWith(word)) {
                affirmative = true;
                break;
            }
        }

        const responseIndex = Math.floor(Math.random() * this.#responses.length);
        const response =
            this.#responses[responseIndex][Math.floor(Math.random() * this.#responses[responseIndex].length)];

        if (affirmative && responseIndex === 2) {
            return this.getResponse(question);
        }

        return response;
    }
}
