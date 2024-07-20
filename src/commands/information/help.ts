import { DEVELOPERS } from "@/internal/constants/developers";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { type MessageBuilder, PaginatedMessage } from "@sapphire/discord.js-utilities";
import type { Command, CommandStore } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { type Collection, ComponentType, SlashCommandBuilder, type User, hyperlink } from "discord.js";

export type SelectMenuOptions = {
    label: string;
    description: string;
    value: string;
};

type CommandField = {
    name: `</${string}:${string}>`;
    value: string;
    inline: boolean;
};

export class HelpCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "See information about the bot and it's available commands.",
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

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const commands: CommandStore = this.container.stores.get("commands");
        const categories: string[] = [...new Set(commands.map((cmd) => cmd.category))] as string[];
        categories.unshift("primary");

        const paginate: PaginatedMessage = new PaginatedMessage().setIdle(Time.Minute * 2);

        const invite = hyperlink(
            "Invite to Server",
            "https://discord.com/api/oauth2/authorize?client_id=911590809873301514&permissions=0&scope=applications.commands%20bot",
        );

        paginate.addPageBuilder((builder: MessageBuilder): MessageBuilder => {
            const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder()
                .setAuthor({
                    name: `${(this.container.client.user as User).username}`,
                    iconURL: (this.container.client.user as User).displayAvatarURL(),
                })
                .setDescription(
                    `Here, you can find a short list of available commands and their descriptions. Please use the select menu below to navigate through the available command categories.\n\nIf you wish to view all commands, please select the ${this.utils.getCommandMention("commands")} command.\n\nInterested about Imperia? Use ${this.utils.getCommandMention(
                        "about",
                    )} to find out more!`,
                )
                .addFields({
                    name: "— Useful Links",
                    value: `${invite}`,
                });

            return builder.setEmbeds([embed]);
        });

        categories.splice(categories.indexOf("system"), !DEVELOPERS.includes(interaction.user.id) ? 1 : 0);

        for (const category of categories) {
            if (category === "primary") continue;
            if (category === "system" && !DEVELOPERS.includes(interaction.user.id)) continue;

            const categoryCommands: Collection<string, Command> = commands.filter(
                (cmd: Command): boolean => cmd.category === category,
            );
            let fields: Command[] = categoryCommands.map((cmd: Command) => cmd);

            if (fields.length > 9) {
                fields = fields.slice(0, 9);
            }

            const commandFields: CommandField[] = fields.map((cmd: Command) => {
                const command = this.utils.getCommandMention(cmd.name);

                return { name: command, value: cmd.description, inline: true } as CommandField;
            });

            paginate.addPageBuilder((builder: MessageBuilder): MessageBuilder => {
                const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder()
                    .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} commands`)
                    .addFields(commandFields);

                return builder.setEmbeds([embed]);
            });
        }

        const selectMenuOptions: SelectMenuOptions[] = [];

        selectMenuOptions.push(
            ...(categories
                .map((category) => {
                    if (category === "system" && !DEVELOPERS.includes(interaction.user.id)) return null;

                    return {
                        label: category.charAt(0).toUpperCase() + category.slice(1),
                        description:
                            category === "primary"
                                ? "View the primary page."
                                : `View ${category.charAt(0).toUpperCase() + category.slice(1)}-related commands.`,
                        value: category,
                    };
                })
                .filter(Boolean) as SelectMenuOptions[]),
        );

        paginate.setActions([
            {
                customId: "help_command_select_menu",
                type: ComponentType.StringSelect,
                options: selectMenuOptions,
                placeholder: "Select a category to view commands.",
                run: ({ handler, interaction }) => {
                    if (interaction.isStringSelectMenu()) {
                        handler.index = categories.indexOf(interaction.values[0]);
                    }
                },
            },
        ]);

        return paginate.run(interaction);
    }
}
