import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import type { EmojiDataResponse } from "@/lib/types/emojidata";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { tryParseJSON } from "@sapphire/utilities";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class EmojifyCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Add emojis to your text!",
            tags: ["text", "fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("text").setDescription("The text to emojify.").setRequired(true),
            );

        void registry.registerChatInputCommand(command);
    }

    #reply = "˖ ݁𖥔 ݁˖ Here's what I made for you~";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const text: string = interaction.options.getString("text", true);
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");

        const emojifiedText: string = await this.emojifyText(text);
        embed.setDescription(emojifiedText);

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
                message: "(゜-゜) You didn't provide any text to emojify, how am I supposed to do that?",
            });
        }

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");

        const text: string = textArgument.unwrap();
        const emojifiedText: string = await this.emojifyText(text);
        embed.setDescription(`${emojifiedText}`);

        return message.reply({
            content: this.#reply,
            embeds: [embed],
        });
    }

    private async getEmojis(): Promise<string | number | boolean | object | null> {
        const emojis = (await this.container.db.dragonfly.call("JSON.GET", "app:emojis")) as string;
        return tryParseJSON(emojis);
    }

    #commonWords: Set<string> = new Set([
        "a",
        "an",
        "as",
        "is",
        "if",
        "of",
        "the",
        "it",
        "its",
        "or",
        "are",
        "this",
        "with",
        "so",
        "to",
        "at",
        "was",
        "and",
    ]);

    #inappropriateEmojis: string[] = [
        "🍆",
        "💦",
        "🍑",
        "🌮",
        "👅",
        "🐍",
        "🔯",
        "🖕",
        "🚬",
        "💣",
        "🔫",
        "🔪",
        "💊",
        "💉",
    ];

    private isInappropriateEmoji(str: string): boolean {
        return this.#inappropriateEmojis.some((emoji: string): boolean => str.includes(emoji));
    }

    private filterEmoji(shouldFilterEmojis: boolean): (option: string) => boolean {
        return shouldFilterEmojis ? (option: string): boolean => !this.isInappropriateEmoji(option) : () => true;
    }

    private async emojifyText(text: string): Promise<string> {
        const emojiData = (await this.getEmojis()) as EmojiDataResponse;
        const shouldFilterEmojis = true;
        const words: string[] = text.replace(/\n/g, " ").split(" ");

        const result: string = words
            .reduce((acc: string, wordRaw: string): string => {
                const word: string = wordRaw.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();

                const accNext: string = `${acc} ${wordRaw}`;

                const randomChoice: number = Math.random() * 100;
                const isTooCommon: boolean = this.#commonWords.has(word);

                const emojiFilter: (option: string) => boolean = this.filterEmoji(shouldFilterEmojis);

                const emojiEntries: [string, string][] = Object.entries(
                    emojiData[word as keyof typeof emojiData] || {},
                );

                const filteredEmojiEntries: [string, string][] = emojiEntries.filter(
                    ([option]: [string, string]): boolean => emojiFilter(option),
                );

                const emojiOptions: string[] = filteredEmojiEntries.reduce(
                    (arr: string[], [option, frequency]: [string, string]): string[] => {
                        const newOptions: string[] = Array(frequency).fill(option);
                        return arr.concat(newOptions);
                    },
                    [] as string[],
                );

                if (isTooCommon || !randomChoice || emojiOptions.length === 0) {
                    return accNext;
                }

                const emojis: string = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];

                return `${accNext} ${emojis}`;
            }, "")
            .trim();

        return result;
    }
}
