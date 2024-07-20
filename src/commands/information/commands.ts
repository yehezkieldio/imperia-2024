import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { CommandUtils } from "@/internal/utils/command-utils";
import { type MessageBuilder, PaginatedMessage } from "@sapphire/discord.js-utilities";
import type { Command, CommandStore } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
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

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("category")
                    .setDescription("The category of commands you want to see.")
                    .setRequired(true)
                    .addChoices(CommandUtils.commandCategories),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<PaginatedMessage> {
        await interaction.deferReply({
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });

        const commands: CommandStore = this.container.stores.get("commands");

        const category: string = interaction.options.getString("category", true);

        const categoryCommands: Collection<string, Command> = commands.filter((cmd) => cmd.category === category);
        const commandsPerPage: number = 8;
        const commandsCount: number = categoryCommands.size;

        const paginate: PaginatedMessage = new PaginatedMessage().setIdle(Time.Minute * 2);

        if (categoryCommands.size > commandsPerPage) {
            const pages: number = Math.ceil(categoryCommands.size / commandsPerPage);

            for (let i = 0; i < pages; i++) {
                const start: number = i * commandsPerPage;
                const end: number = start + commandsPerPage;

                const pageCommands: Command[] = Array.from(categoryCommands.values()).slice(start, end);

                paginate.addPageBuilder((builder: MessageBuilder): MessageBuilder => {
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

            paginate.addPageBuilder((builder: MessageBuilder): MessageBuilder => {
                return builder.setEmbeds([embed]);
            });
        }

        paginate.setActions([
            {
                customId: "commands_list_previous_page",
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
                customId: "commands_list_next_page",
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
