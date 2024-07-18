import { commonWords, inappropriateEmojis } from "@/internal/constants/emoji";
import emojiData from "@/internal/database/data/emoji-data.json";
import { ImperiaCommand } from "@/internal/extensions/command";
import { type InteractionResponse, SlashCommandBuilder } from "discord.js";

export class EmojifyCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Add some emojis to your text!",
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
                option.setName("text").setDescription("The text you want to emojify.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const isInappropriate = (str: string) => inappropriateEmojis.some((emoji: string) => str.includes(emoji));
        const shouldFilterEmojis = true;

        const words = interaction.options.getString("text", true).replace(/\n/g, " ").split(" ");

        const result = words
            .reduce((acc: string, wordRaw: string) => {
                const word: string = wordRaw.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();

                const accNext: string = `${acc} ${wordRaw}`;

                const randomChoice: number = Math.random() * 100;
                const isTooCommon: boolean = commonWords.has(word);

                const emojiFilter = shouldFilterEmojis ? (option: string) => !isInappropriate(option) : () => true;

                const emojiOptions: string[] = Object.entries(emojiData[word as keyof typeof emojiData] || {})
                    .filter(([option]) => emojiFilter(option))
                    .reduce((arr, [option, frequency]) => {
                        const newOptions = Array(frequency).fill(option);
                        return arr.concat(newOptions);
                    }, [] as string[]);

                if (isTooCommon || !randomChoice || emojiOptions.length === 0) {
                    return accNext;
                }

                const emojis: string = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];

                return `${accNext} ${emojis}`;
            }, "")
            .trim();

        return interaction.reply({ content: result, ephemeral: await this.utils.responsePrivacy(interaction.user.id) });
    }
}
