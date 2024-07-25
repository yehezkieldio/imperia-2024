import { ImperiaCommand } from "@/core/extensions/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Perform a ping command to check the bot's latency.",
            tags: ["utility"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        const msg: Message = await interaction.reply({
            content: "Performing a ping request... ＼(-_- )",
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const { diff, ping } = await this.getPing(msg, interaction);

            return interaction.editReply(
                `(・ω・｀)……….. Returned with these results:\n\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return interaction.editReply("(／。＼) Failed to perform ping request.");
    }

    public async messageRun(message: Message): Promise<Message> {
        const msg: Message = await message.reply({
            content: "Performing a ping request... ＼(-_- )",
        });

        if (isMessageInstance(msg)) {
            const { diff, ping } = await this.getPing(msg, message);

            return msg.edit(
                `(・ω・｀)……….. Returned with these results:\n\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return message.reply("(／。＼) Failed to perform ping request.");
    }

    private async getPing(
        msg: Message,
        ctx: Message | ImperiaCommand.ChatInputCommandInteraction,
    ): Promise<{
        diff: number;
        ping: number;
    }> {
        const diff: number = msg.createdTimestamp - ctx.createdTimestamp;
        const ping: number = Math.round(this.container.client.ws.ping);

        return {
            diff,
            ping,
        };
    }
}
