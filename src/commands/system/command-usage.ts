import { DEVELOPMENT_SERVERS } from "@/internal/constants/developers";
import { commandUsage } from "@/internal/database/postgres/schema";
import { ImperiaCommand } from "@/internal/extensions/command";
import dayjs from "dayjs";
import { type InteractionResponse, SlashCommandBuilder, type User } from "discord.js";
import { eq } from "drizzle-orm";

export class LastCommandUsageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Display a list of the last cmds used in the server, or a user for the last five minutes.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry) {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to display the last commands for.").setRequired(false),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: DEVELOPMENT_SERVERS,
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User | null = interaction.options.getUser("user");

        if (!user) {
            const lastCommands = await this.container.db.select().from(commandUsage);

            const filteredCommands = lastCommands.filter((entry) => {
                const entryTime = dayjs(entry.timestamp);
                const currentTime = dayjs();
                const difference = currentTime.diff(entryTime, "minute");

                return difference <= 15;
            });

            if (filteredCommands.length === 0) {
                return interaction.reply({
                    content: "No commands have been used in the last five minutes.",
                    ephemeral: await this.utils.responsePrivacy(interaction.user.id),
                });
            }

            filteredCommands.splice(20);

            const mapCommands = filteredCommands.map(async (entry) => {
                return `Server ${await this.mapGuildIdToName(entry.guildId)} - ${entry.command} - ${dayjs(entry.timestamp).format("HH:mm:ss")}`;
            });

            const commands = await Promise.all(mapCommands);

            return interaction.reply({
                content: commands.join("\n"),
                ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            });
        }

        const lastCommands = await this.container.db
            .select()
            .from(commandUsage)
            .where(eq(commandUsage.discordId, user.id));

        const filteredCommands = lastCommands.filter((entry) => {
            const entryTime = dayjs(entry.timestamp);
            const currentTime = dayjs();
            const difference = currentTime.diff(entryTime, "minute");

            return difference <= 15;
        });

        if (filteredCommands.length === 0) {
            return interaction.reply({
                content: `No commands have been used by ${user.username} in the last five minutes.`,
                ephemeral: await this.utils.responsePrivacy(interaction.user.id),
            });
        }

        filteredCommands.splice(20);

        const mapCommands = filteredCommands.map(async (entry) => {
            return `Server: ${await this.mapGuildIdToName(entry.guildId)} - User: ${await this.mapUserIdToUsername(entry.discordId)} - ${entry.command} - ${dayjs(entry.timestamp).format("HH:mm:ss")}`;
        });

        const commands = await Promise.all(mapCommands);

        return interaction.reply({
            content: commands.join("\n"),
            ephemeral: await this.utils.responsePrivacy(interaction.user.id),
        });
    }

    private async mapUserIdToUsername(userId: string) {
        const user = await this.container.client.users.fetch(userId);

        return user.username;
    }

    private async mapGuildIdToName(guildId: string) {
        const guild = await this.container.client.guilds.fetch(guildId);

        return guild.name;
    }
}
