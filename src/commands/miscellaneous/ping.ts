import { ImperiaCommand } from "@/lib/extensions/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Check the bot's latency.",
            tags: ["utility"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    #pleaseWait = "( ノ・・)ノ Please wait...";
    #failedRequest = "(／。＼) Failed to perform ping request.";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        const msg: Message = await interaction.reply({
            content: this.#pleaseWait,
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.ContextMessage = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return interaction.editReply(this.#failedRequest);
    }

    public async messageRun(message: Message): Promise<Message> {
        const msg: Message = await message.reply(this.#pleaseWait);

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.ContextMessage = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return message.edit(this.#failedRequest);
    }

    private async getLatency(message: Message, context: ImperiaCommand.ContextMessage) {
        const diff: number = message.createdTimestamp - context.createdTimestamp;
        const ping: number = Math.round(this.container.client.ws.ping);

        return `( ^_^)／ Latency: ${diff}ms | Ping: ${ping}ms`;
    }
}
