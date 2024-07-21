import { ImperiaCommand } from "@/core/extensions/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { type Message, SlashCommandBuilder } from "discord.js";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Perform a ping command to check the bot's latency.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
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
            content: "Performing a ping request...",
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const { diff, ping } = await this.processPing(msg, interaction);

            return interaction.editReply(
                `Ping request returned with these results:\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return interaction.editReply("Failed to perform ping request.");
    }

    public async messageRun(message: Message): Promise<Message> {
        const msg: Message = await message.reply({
            content: "Performing a ping request...",
        });

        if (isMessageInstance(msg)) {
            const { diff, ping } = await this.processPing(msg, message);

            return msg.edit(
                `Ping request returned with these results:\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return message.reply("Failed to perform ping request.");
    }

    private async processPing(
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
