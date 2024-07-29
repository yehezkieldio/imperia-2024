import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

interface RandomDuck {
    message?: string;
    url: string;
}

export class DuckCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Get a random duck image.",
            aliases: ["ducks"],
            tags: ["image"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const result = await this.getImage();

        if (!result) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I can't seem to fetch a duck image right now, please try again later.",
            });
        }

        return interaction.reply({ content: result.reply, embeds: [result.embed] });
    }

    public async messageRun(message: Message): Promise<Message> {
        const result = await this.getImage();

        if (!result) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( ノ・・)ノ I can't seem to fetch a duck image right now, please try again later.",
            });
        }

        return message.reply({ content: result.reply, embeds: [result.embed] });
    }

    private async getImage() {
        const url: string = "https://random-d.uk/api/random";

        try {
            const response = await fetch<RandomDuck>(url, FetchResultTypes.JSON);

            const reply = "˖ ݁𖥔 ݁˖ Here's a random duck for you~";

            const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");
            embed.setImage(response.url);

            return {
                reply: reply,
                embed: embed,
            };
        } catch (error) {
            this.container.logger.error(error);
        }
    }
}
