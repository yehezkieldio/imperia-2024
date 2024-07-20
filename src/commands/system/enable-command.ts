import { DEVELOPMENT_SERVERS } from "@/internal/constants/developers";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { RegisterBehavior } from "@sapphire/framework";
import { type InteractionResponse, SlashCommandBuilder } from "discord.js";

export class EnableCommandCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Globally enable a command.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["DeveloperOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("command").setDescription("The command name to enable.").setRequired(true),
            );

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.VerboseOverwrite,
            guildIds: DEVELOPMENT_SERVERS,
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const commandName: string = interaction.options.getString("command", true);

        const command = this.container.stores.get("commands").get(commandName);

        if (!command) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().setDescription("That command does not exist.")],
            });
        }

        if (command.enabled === true) {
            return interaction.reply({
                embeds: [new ImperiaEmbedBuilder().setDescription("That command is already enabled.")],
            });
        }

        command.enabled = true;

        return interaction.reply({
            embeds: [new ImperiaEmbedBuilder().setDescription(`Enable the command ${command.name}.`)],
        });
    }
}
