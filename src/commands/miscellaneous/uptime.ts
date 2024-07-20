import os from "node:os";
import { ImperiaCommand } from "@/internal/extensions/command";
import { humanizeDuration } from "@/internal/utils/time-utils";
import { type InteractionResponse, SlashCommandBuilder } from "discord.js";

export class UptimeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View the bot's uptime and the host machine's uptime.",
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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const botUptime: number = this.container.client.uptime as number;
        const machineUptime: number = os.uptime();

        return interaction.reply({
            content: `Bot Uptime: ${humanizeDuration(botUptime)}\nMachine Uptime: ${humanizeDuration(machineUptime)}`,
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }
}
