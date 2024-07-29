import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class AestheticCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Turn your text into aesthetic fullwidth text!",
            aliases: ["fullwidth"],
            tags: ["text", "fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("text").setDescription("The text to convert.").setRequired(true),
            );

        void registry.registerChatInputCommand(command);
    }

    #reply = "˖ ݁𖥔 ݁˖ Here's what I converted for you~";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const text: string = interaction.options.getString("text", true);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");

        const convertedText: string = this.convertToFullWidth(text);
        embed.setDescription(convertedText);

        return interaction.reply({
            content: this.#reply,
            embeds: [embed],
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const textArgument: ResultType<string> = await args.restResult("string");

        if (textArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any text to convert, how am I supposed to do that?",
            });
        }

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");

        const text: string = textArgument.unwrap();
        const convertedText: string = this.convertToFullWidth(text);
        embed.setDescription(`${convertedText}`);

        return message.reply({
            content: this.#reply,
            embeds: [embed],
        });
    }

    private convertToFullWidth(text: string): string {
        return text.replace(/[!-~]/g, (char: string): string => {
            const code: number = char.charCodeAt(0);
            return String.fromCharCode(code + 0xfee0);
        });
    }
}
