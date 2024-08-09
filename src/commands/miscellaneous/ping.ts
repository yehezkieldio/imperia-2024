import { ImperiaCommand } from "@/lib/extensions/commands/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Check the bot's latency.",
            tags: ["utility"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    #pleaseWait = "Please wait...";
    #failed = "Failed to retrieve ping latency.";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const msg: Message = await interaction.reply({
            content: this.#pleaseWait,
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.MessageContext = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return interaction.editReply(this.#failed);
    }

    public async messageRun(message: Message) {
        const msg: Message = await message.reply(this.#pleaseWait);

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.MessageContext = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return message.edit(this.#failed);
    }

    private async getLatency(message: Message, context: ImperiaCommand.MessageContext) {
        const diff: number = message.createdTimestamp - context.createdTimestamp;
        const ping: number = Math.round(this.container.client.ws.ping);

        return `Heartbeat: ${ping}ms, Roundtrip: ${diff}ms.`;
    }
}
