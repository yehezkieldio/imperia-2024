import { ImperiaCommand } from "@/lib/extensions/command";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { DurationFormatter } from "@sapphire/time-utilities";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class UptimeCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Check the uptime of the bot.",
            tags: ["bot"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return interaction.reply({
            content: `(・ω・｀)……….. I've been awake for ${this.getUptime()}.`,
        });
    }

    public async messageRun(message: Message): Promise<Message> {
        return message.reply(`(・ω・｀)……….. I've been awake for ${this.getUptime()}.`);
    }

    private getUptime(): string {
        const uptime: number = this.container.client.uptime ?? 0;
        const formatter = new DurationFormatter();

        return formatter.format(uptime);
    }
}
