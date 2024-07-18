import { ImperiaCommand } from "@/internal/extensions/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import dayjs from "dayjs";
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
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const diff: number = dayjs(msg.createdTimestamp).diff(dayjs(interaction.createdTimestamp));
            const ping: number = Math.round(this.container.client.ws.ping);

            return interaction.editReply(
                `Ping request returned with these results:\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return interaction.editReply("Failed to perform ping request.");
    }
}
