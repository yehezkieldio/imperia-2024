import { ImperiaCommand } from "@/core/extensions/command";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type InteractionResponse, type Message, SlashCommandBuilder } from "discord.js";

export class FilterImageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Apply a filter or effect to an image.",
            tags: ["media"],
            aliases: ["filter"],
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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return interaction.reply({
            content: "This command is under construction.",
        });
    }

    public async messageRun(message: Message): Promise<Message> {
        if (message.attachments.size === 0) return message.reply("No image was provided.");

        return message.reply("This command is under construction.");
    }
}
