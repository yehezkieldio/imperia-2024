import { HELP_COMMAND_ID } from "@/internal/constants/ids";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import type { CommandField, SelectMenuOptions } from "@/internal/types/typings";
import { getCommandMention } from "@/internal/utils/command-utils";
import { checkDeveloper } from "@/internal/utils/string-utils";
import { type MessageBuilder, PaginatedMessage } from "@sapphire/discord.js-utilities";
import { type Command, type CommandStore, RegisterBehavior } from "@sapphire/framework";
import { type Collection, ComponentType, SlashCommandBuilder, type User, hyperlink } from "discord.js";

export class HelpCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "See information about the bot and it's available commands.",
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
        await interaction.deferReply({
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });

        const commands: CommandStore = this.container.stores.get("commands");
        const categories: string[] = [...new Set(commands.map((cmd) => cmd.category))] as string[];
        categories.unshift("primary");

        const paginate: PaginatedMessage = new PaginatedMessage();

        const invite = hyperlink(
            "Invite to Server",
            "https://discord.com/api/oauth2/authorize?client_id=911590809873301514&permissions=0&scope=applications.commands%20bot",
        );

        paginate.addPageBuilder((builder: MessageBuilder) => {
            const embed = new ImperiaEmbedBuilder()
                .setAuthor({
                    name: `${(this.container.client.user as User).username}`,
                    iconURL: (this.container.client.user as User).displayAvatarURL(),
                })
                .setDescription(
                    `Here, you can find a list of available commands and their descriptions. Please use the select menu below to navigate through the available command categories.\n\nInterested about Imperia? Use ${getCommandMention(
                        "about",
                    )} to find out more!`,
                )
                .addFields({
                    name: "— Useful Links",
                    value: `${invite}`,
                });

            return builder.setEmbeds([embed]);
        });

        categories.splice(categories.indexOf("system"), !checkDeveloper(interaction.user.id) ? 1 : 0);

        for (const category of categories) {
            if (category === "primary") continue;
            if (category === "system" && !checkDeveloper(interaction.user.id)) continue;

            const categoryCommands: Collection<string, Command> = commands.filter(
                (cmd: Command): boolean => cmd.category === category,
            );
            const fields: Command[] = categoryCommands.map((cmd: Command) => cmd);

            const commandFields: CommandField[] = fields.map((cmd: Command) => {
                const command = getCommandMention(cmd.name);

                return { name: command, value: cmd.description, inline: true } as CommandField;
            });

            paginate.addPageBuilder((builder: MessageBuilder) => {
                const embed = new ImperiaEmbedBuilder()
                    .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} commands`)
                    .addFields(commandFields);

                return builder.setEmbeds([embed]);
            });
        }

        const selectMenuOptions: SelectMenuOptions[] = [];

        selectMenuOptions.push(
            ...(categories
                .map((category) => {
                    if (category === "system" && !checkDeveloper(interaction.user.id)) return null;

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
                customId: HELP_COMMAND_ID,
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