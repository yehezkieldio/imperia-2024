import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    type UserError,
} from "@sapphire/framework";
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

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder();
        const filterArgument: ResultType<string> = await args.pickResult("imageFilter");

        if (filterArgument.isErr()) {
            const error: UserError | ArgumentError<string> = filterArgument.unwrapErr();
            embed.isErrorEmbed();

            if (error.identifier === ImperiaIdentifiers.ArgumentFilterImageError) {
                const [title, ...descArray] = error.message.split("!");
                const desc: string = descArray.join("!").trim();

                embed.setTitle(title);
                embed.setDescription(desc);
                return message.reply({ embeds: [embed] });
            }

            embed.setTitle("Missing required arguments to execute this command!");
            embed.setDescription("You haven't provided a valid filter to apply to the image.");
            return message.reply({ embeds: [embed] });
        }

        if (message.attachments.size === 0) return message.reply("Please attach an image to apply a filter to.");

        return message.reply("This command is under construction.");
    }
}
