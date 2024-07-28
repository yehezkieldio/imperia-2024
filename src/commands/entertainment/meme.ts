import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder, hyperlink } from "discord.js";

export class MemeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Get a random meme from r/DankMemes",
            aliases: ["memes", "randommeme", "randommemes"],
            tags: ["meme", "image"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const { reply, embed } = await this.getMeme();

        return interaction.reply({ content: reply, embeds: [embed] });
    }

    public async messageRun(message: Message): Promise<Message> {
        const { reply, embed } = await this.getMeme();

        return message.reply({ content: reply, embeds: [embed] });
    }

    private async getMeme() {
        const url = await this.container.services.reddit.getRandomMeme();

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");

        const reply = "˖ ݁𖥔 ݁˖ Here's a random meme for you~";

        embed
            .setImage(url)
            .setDescription(
                `This meme was provided to you by ${hyperlink("r/DanMemes", "https://www.reddit.com/r/dankmemes")}`,
            );

        return {
            reply,
            embed,
        };
    }
}
