import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaEmbedBuilder } from "@/core/extensions/embed-builder";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Timestamp } from "@sapphire/time-utilities";
import {
    type APIEmbedField,
    type Guild,
    type InteractionResponse,
    type Message,
    SlashCommandBuilder,
    bold,
} from "discord.js";

export class ServerInfoCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View information about the server.",
            aliases: ["serverinfo", "guildinfo", "server", "guild"],
            tags: ["information", "server"],
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
        const embed: ImperiaEmbedBuilder = await this.generateResponseEmbed(interaction.guild);

        return interaction.reply({ embeds: [embed] });
    }

    public async messageRun(message: Message): Promise<Message> {
        const embed: ImperiaEmbedBuilder = await this.generateResponseEmbed(message.guild);

        return message.reply({ embeds: [embed] });
    }

    private async getServerInfo(guild: Guild) {
        const premiumTiers: string[] = ["None", "Tier 1", "Tier 2", "Tier 3"];

        return {
            bio: {
                createdAt: new Timestamp("MMMM d YYYY").display(guild.createdAt),
                name: guild.name,
                description: guild.description === null ? "No description" : guild.description,
                id: guild.id,
                ownership: (await guild.fetchOwner()).user.username,
            },
            statistics: {
                members: guild.memberCount,
                channels: guild.channels.cache.size,
                roles: guild.roles.cache.size,
                emojis: guild.emojis.cache.size,
                stickers: guild.stickers.cache.size,
            },
            features: {
                boostLevel: premiumTiers[guild.premiumTier],
                boostCount: guild.premiumSubscriptionCount,
                verifiedStatus: guild.verified ? "Verified" : "Not Verified",
                partneredStatus: guild.partnered ? "Partnered" : "Not Partnered",
                vanityURL: guild.vanityURLCode === null ? "No Vanity URL" : `discord.gg/${guild.vanityURLCode}`,
            },
        };
    }

    private async generateEmbedFields(guild: Guild): Promise<APIEmbedField[]> {
        const { bio, statistics, features } = await this.getServerInfo(guild);

        const info: string[] = [
            `${bold("Created At:")} ${bio.createdAt}`,
            `${bold("Name")} ${bio.name}`,
            `${bold("Description")} ${bio.description}`,
            `${bold("ID")} ${bio.id}`,
            `${bold("Owner")} ${bio.ownership}`,
        ];

        const stats: string[] = [
            `${bold("Members")} ${statistics.members}`,
            `${bold("Channels")} ${statistics.channels}`,
            `${bold("Roles")} ${statistics.roles}`,
            `${bold("Emojis")} ${statistics.emojis}`,
            `${bold("Stickers")} ${statistics.stickers}`,
        ];

        const featuresList: string[] = [
            `${bold("Boost Level")} ${features.boostLevel}`,
            `${bold("Boost Count")} ${features.boostCount}`,
            `${bold("Verified Status")} ${features.verifiedStatus}`,
            `${bold("Partnered Status")} ${features.partneredStatus}`,
            `${bold("Vanity URL")} ${features.vanityURL}`,
        ];

        return [
            { name: "Information", value: info.join("\n") },
            { name: "Statistics", value: stats.join("\n") },
            { name: "Features", value: featuresList.join("\n") },
        ];
    }

    private async generateResponseEmbed(guild: Guild | null) {
        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().isInformationEmbed();

        if (!guild) {
            embed.setDescription("The server is currently unavailable.");
            return embed;
        }

        const fields: APIEmbedField[] = await this.generateEmbedFields(guild);

        embed.setTitle(guild.name);
        embed.addFields(fields);

        return embed;
    }
}
