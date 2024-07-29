import { ImperiaCommand } from "@/lib/extensions/command";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class CoinFlipCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Flip a coin.",
            tags: ["fun"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const result: string = await this.flipCoin();

        return interaction.reply(`(´つヮ⊂) You flipped a coin and it landed on **${result}**.`);
    }

    public async messageRun(message: Message): Promise<Message> {
        const result: string = await this.flipCoin();

        return message.reply(`(´つヮ⊂) You flipped a coin and it landed on **${result}**.`);
    }

    private async flipCoin() {
        const result: string = ["Heads", "Tails"][Math.floor(Math.random() * 2)];

        return result;
    }
}
