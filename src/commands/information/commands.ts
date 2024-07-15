import { COMMANDS_LIST_NEXT_PAGE_ID, COMMANDS_LIST_PREVIOUS_PAGE_ID } from "@/internal/constants/ids";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { type Command, type CommandStore, RegisterBehavior } from "@sapphire/framework";
import { ButtonStyle } from "discord.js";
import { ComponentType } from "discord.js";
import { type Collection, SlashCommandBuilder } from "discord.js";

export class CommandsListCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "See all available commands.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("category")
                    .setDescription("The category of commands you want to see.")
                    .setRequired(true)
                    .setAutocomplete(true),
            );

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

        const category = interaction.options.getString("category", true);

        const categoryCommands: Collection<string, Command> = commands.filter((cmd) => cmd.category === category);
        const commandsPerPage = 8;
        const commandsCount = categoryCommands.size;

        const paginate = new PaginatedMessage();

        if (categoryCommands.size > commandsPerPage) {
            const pages = Math.ceil(categoryCommands.size / commandsPerPage);

            for (let i = 0; i < pages; i++) {
                const start = i * commandsPerPage;
                const end = start + commandsPerPage;

                const pageCommands = Array.from(categoryCommands.values()).slice(start, end);

                paginate.addPageBuilder((builder) => {
                    const commandFields = pageCommands.map((cmd) => {
                        return {
                            name: `${cmd.name}`,
                            value: cmd.description,
                        };
                    });

                    const embed = new ImperiaEmbedBuilder();
                    embed.setTitle(
                        category.indexOf(" ") !== -1 ? category : category.charAt(0).toUpperCase() + category.slice(1),
                    );
                    embed.setDescription(
                        `Displaying all commands in the ${category} category, a total of ${commandsCount} commands.`,
                    );
                    embed.addFields(commandFields);

                    return builder.setEmbeds([embed]);
                });
            }
        } else {
            const commandFields = categoryCommands.map((cmd) => {
                return {
                    name: `${cmd.name}`,
                    value: cmd.description,
                };
            });

            const embed = new ImperiaEmbedBuilder();
            embed.setTitle(
                category.indexOf(" ") !== -1 ? category : category.charAt(0).toUpperCase() + category.slice(1),
            );
            embed.setDescription(
                `Displaying all commands in the ${category} category, a total of ${commandsCount} commands.`,
            );
            embed.addFields(commandFields);

            paginate.addPageBuilder((builder) => {
                return builder.setEmbeds([embed]);
            });
        }

        paginate.setActions([
            {
                customId: COMMANDS_LIST_PREVIOUS_PAGE_ID,
                type: ComponentType.Button,
                label: "Previous",
                style: ButtonStyle.Secondary,
                run: ({ handler }) => {
                    if (handler.index === 0) {
                        handler.index = handler.pages.length - 1;
                    } else {
                        --handler.index;
                    }
                },
            },
            {
                customId: COMMANDS_LIST_NEXT_PAGE_ID,
                type: ComponentType.Button,
                label: "Next",
                style: ButtonStyle.Secondary,
                run: ({ handler }) => {
                    if (handler.index === handler.pages.length - 1) {
                        handler.index = 0;
                    } else {
                        ++handler.index;
                    }
                },
            },
        ]);

        return paginate.run(interaction);
    }
}
