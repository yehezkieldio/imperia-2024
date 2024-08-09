import { ImperiaSubcommand } from "@/lib/extensions/commands/subcommand";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import type { Guild, User } from "discord.js";

// Extend `ImperiaSubcommand` instead of `Command`
export class BlacklistCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaSubcommand.Context, options: ImperiaSubcommand.Options) {
        super(context, {
            ...options,
            name: "blacklist",
            tags: ["development"],
            description: "Manage the blacklist",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            preconditions: ["DeveloperUserOnly"],
            subcommands: [
                {
                    name: "list",
                    chatInputRun: "chatInputList",
                },
                {
                    name: "add",
                    chatInputRun: "chatInputAdd",
                },
                {
                    name: "remove",
                    chatInputRun: "chatInputRemove",
                },
            ],
        });
    }

    public registerApplicationCommands(registry: ImperiaSubcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("list")
                        .setDescription("List blacklisted entities.")
                        .addStringOption((option) =>
                            option
                                .setName("type")
                                .setDescription("Type of entity to list.")
                                .addChoices([
                                    {
                                        name: "Users",
                                        value: "user",
                                    },
                                    {
                                        name: "Guilds",
                                        value: "guild",
                                    },
                                ])
                                .setRequired(true),
                        ),
                )
                .addSubcommand((command) =>
                    command
                        .setName("add")
                        .setDescription("Add a entity to the blacklist.")
                        .addStringOption((option) =>
                            option
                                .setName("type")
                                .setDescription("Type of entity to add.")
                                .addChoices([
                                    {
                                        name: "Users",
                                        value: "user",
                                    },
                                    {
                                        name: "Guilds",
                                        value: "guild",
                                    },
                                ])
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option.setName("id").setDescription("ID of the entity to add.").setRequired(true),
                        ),
                )
                .addSubcommand((command) =>
                    command
                        .setName("remove")
                        .setDescription("Remove a entity from the blacklist.")
                        .addStringOption((option) =>
                            option
                                .setName("type")
                                .setDescription("Type of entity to remove")
                                .addChoices([
                                    {
                                        name: "Users",
                                        value: "user",
                                    },
                                    {
                                        name: "Guilds",
                                        value: "guild",
                                    },
                                ])
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option.setName("id").setDescription("ID of the entity to add.").setRequired(true),
                        ),
                ),
        );
    }

    public async chatInputList(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        const type = interaction.options.getString("type", true) as "users" | "guilds";

        const entities: string[] =
            type === "users"
                ? await this.container.repos.users.getBlacklistedUsers()
                : await this.container.repos.guilds.getBlacklistedGuilds();
        if (!entities.length) {
            return interaction.reply(`¯(°_o)/¯ There are no blacklisted ${type}. Good for them!`);
        }

        const names: string[] = entities.map((id: string) => {
            const guild: Guild | undefined = this.container.client.guilds.cache.get(id);
            const user: User | undefined = this.container.client.users.cache.get(id);

            if (guild) {
                return `${guild.name} (${guild.id})`;
            }

            if (user) {
                return `${user.username} (${user.id})`;
            }

            return id;
        });

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setTheme("info");

        embed.setFields([
            {
                name: `— Blacklisted ${capitalizeFirstLetter(type)}`,
                value: names.join("\n"),
            },
        ]);

        return await interaction.reply({
            content: "˖ ݁𖥔 ݁˖ Here's what you requested~",
            embeds: [embed],
        });
    }

    public async chatInputAdd(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        const type = interaction.options.getString("type", true) as "user" | "guild";
        const id: string = interaction.options.getString("id", true);

        if (type === "user") {
            await this.container.repos.users.blacklistUser(id);
        } else {
            await this.container.repos.guilds.blacklistGuild(id);
        }

        return interaction.reply(`˖ ݁𖥔 ݁˖ ${id} has been blacklisted!`);
    }

    public async chatInputRemove(interaction: ImperiaSubcommand.ChatInputCommandInteraction) {
        const type = interaction.options.getString("type", true) as "user" | "guild";
        const id: string = interaction.options.getString("id", true);

        if (type === "user") {
            await this.container.repos.users.unblacklistUser(id);
        } else {
            await this.container.repos.guilds.unblacklistGuild(id);
        }

        return interaction.reply(`˖ ݁𖥔 ݁˖ ${id} has been unblacklisted!`);
    }
}
