import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder, bold } from "discord.js";

export class DankMemeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Get a random meme from r/DankMemes",
            aliases: ["dankmemes"],
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
        const { title, url } = await this.container.services.reddit.getRandom("dankdemes");

        if (!(await this.container.utilities.toolbox.isValidUrl(url))) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "d(-_^) Seems like the fetched meme is invalid, please try again.",
            });
        }

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");
        const reply = "˖ ݁𖥔 ݁˖ Here's a random meme for you~";

        embed.setDescription(`— ${bold(title)}`);
        embed.setFooter({
            iconURL: this.container.services.reddit.redditIconUrl,
            text: "r/DankMemes",
        });
        embed.setImage(url);

        return {
            reply,
            embed,
        };
    }
}
