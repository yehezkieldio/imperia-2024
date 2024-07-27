import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class OwoifyCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Convert your text to OwOspeak, UwU!",
            aliases: ["owo", "uwu", "owofy", "uwufy"],
            tags: ["text", "fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    #reply = "˖ ݁𖥔 ݁˖ Here's what I converted for you~";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return interaction.reply("This command is under construction.");
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const textArgument: ResultType<string> = await args.restResult("string");

        if (textArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any text to owoify, how am I supposed to do that?",
            });
        }

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");

        const text: string = textArgument.unwrap();
        const emojifiedText: string = this.convertTextToOwo(text);
        embed.setDescription(`${emojifiedText}`);

        return message.reply({
            content: this.#reply,
            embeds: [embed],
        });
    }

    private convertTextToOwo(text: string): string {
        const preConvertedText: string = this.preConversion(text);
        let convertedText: string = this.convertToOwo(preConvertedText);
        convertedText = this.addStuttering(convertedText);
        convertedText = this.addRandomEmoticons(convertedText);
        convertedText = this.addExtraWSounds(convertedText);
        const postConvertedText: string = this.postConversion(convertedText);

        return postConvertedText;
    }

    private convertToOwo(text: string): string {
        return text
            .replace(/(?:r|l)/g, "w")
            .replace(/(?:R|L)/g, "W")
            .replace(/n([aeiou])/g, "ny$1")
            .replace(/N([aeiou])/g, "Ny$1")
            .replace(/N([AEIOU])/g, "Ny$1")
            .replace(/ove/g, "uv")
            .replace(/!+/g, " " + "UwU");
    }

    private preConversion(text: string): string {
        return text
            .replace(/hi/g, "konnichiwa")
            .replace(/hello/g, "konnichiwa")
            .replace(/bye/g, "sayonara")
            .replace(/goodbye/g, "sayonara")
            .replace(/thanks/g, "arigatou")
            .replace(/thank you/g, "arigatou");
    }

    private postConversion(text: string): string {
        return text
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)")
            .replace(/:D/g, " (≧∇≦)/")
            .replace(/:P/g, " (￣ω￣)")
            .replace(/:O/g, " (◕‿◕✿)")
            .replace(/:3/g, " (´ω｀)");
    }

    private addStuttering(text: string): string {
        return text.replace(/\b([a-zA-Z])/g, "$1-$1");
    }

    private addRandomEmoticons(text: string): string {
        const emoticons = [
            " (≧◡≦)",
            " (´｡• ω •｡`)",
            " (✿◕‿◕)",
            " (◕‿◕✿)",
            " (◕‿◕)",
            " (｡♥‿♥｡)",
            " (UwU)",
            " (OwO)",
            " (♥‿♥)",
        ];
        return text.replace(/(\s|$)/g, (match) =>
            Math.random() > 0.8 ? emoticons[Math.floor(Math.random() * emoticons.length)] + match : match,
        );
    }

    private addExtraWSounds(text: string): string {
        return text.replace(/\b([aeiouAEIOU])/g, "w$1");
    }
}
