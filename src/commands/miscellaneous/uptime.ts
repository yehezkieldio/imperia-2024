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
            content: `I've been online for ${this.humanizeDuration(botUptime)} and my host machine has been online for ${this.humanizeDuration(
                machineUptime,
            )}.`,
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }

    private humanizeDuration(ms: number): string {
        const duration: Dayjs = dayjs(ms);
        const hours: number = duration.hour();
        const minutes: number = duration.minute();
        const seconds: number = duration.second();

        if (hours > 0) return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
        if (minutes > 0) return `${minutes} minutes and ${seconds} seconds`;
        if (seconds > 0) return `${seconds} seconds`;

        return "less than a second";
    }
}
