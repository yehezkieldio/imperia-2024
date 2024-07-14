import { ImperiaCommand } from "@/internal/extensions/command";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { RegisterBehavior } from "@sapphire/framework";
import { SlashCommandBuilder } from "discord.js";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Perform a ping command to check the bot's latency.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const msg = await interaction.reply({
            content: "Performing a ping request...",
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(
                `Ping request returned with these results:\nRound trip took: ${diff}ms.\nHeartbeat: ${ping}ms.`,
            );
        }

        return interaction.editReply("Failed to perform ping request.");
    }
}
