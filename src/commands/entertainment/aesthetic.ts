import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class AestheticCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Convert your provided text into aesthetic text.",
            tags: ["entertainment", "text"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("text").setDescription("The text to convert into aesthetic text.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const text: string = interaction.options.getString("text", true);

        return interaction.reply(this.toFullWidth(text));
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const textArgument: ResultType<string> = await args.restResult("string");

        if (textArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide a text for me! How am I supposed to do anything?",
            });
        }

        const text: string = textArgument.unwrap();

        return message.reply(this.toFullWidth(text));
    }

    private toFullWidth(text: string): string {
        return text.replace(/[!-~]/g, (char: string): string => {
            const code: number = char.charCodeAt(0);
            return String.fromCharCode(code + 0xfee0);
        });
    }
}
