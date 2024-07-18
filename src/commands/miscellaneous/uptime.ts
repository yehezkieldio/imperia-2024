import os from "node:os";
import { ImperiaCommand } from "@/internal/extensions/command";
import dayjs, { type Dayjs } from "dayjs";
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
            content: `Bot Uptime: ${this.humanizeDuration(botUptime)}\nMachine Uptime: ${this.humanizeDuration(machineUptime)}`,
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }

    private humanizeDuration(ms: number): string {
        const duration: Dayjs = dayjs(ms);
        const hours: number = duration.get("hours");
        const minutes: number = duration.get("minutes");
        const seconds: number = duration.get("seconds");

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours} hours`);
        if (minutes > 0) parts.push(`${minutes} minutes`);
        if (seconds > 0) parts.push(`${seconds} seconds`);

        return parts.length > 0 ? parts.join(", ") : "less than a second";
    }
}
