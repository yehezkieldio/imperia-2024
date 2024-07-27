import type { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaSubcommand } from "@/lib/extensions/subcommand";
import { type Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import type { Guild, Message } from "discord.js";

export class ServerBlacklistCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Manage the server blacklist.",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            preconditions: ["DeveloperOnly"],
            subcommands: [
                {
                    name: "list",
                    messageRun: "messageServerList",
                    default: true,
                },
                {
                    name: "add",
                    messageRun: "messageServerAdd",
                },
                {
                    name: "remove",
                    messageRun: "messageServerRemove",
                },
            ],
        });
    }

    public async messageServerList(message: Message): Promise<Message> {
        const blacklistedServers: string[] = await this.container.services.blacklist.getServers();

        if (blacklistedServers.length === 0) {
            return await message.reply({
                content: "(゜-゜) There are no blacklisted servers. Good for them!",
            });
        }

        const guildNames: string[] = blacklistedServers.map((serverId: string) => {
            const guild: Guild | undefined = this.container.client.guilds.cache.get(serverId);
            return guild ? `${guild.name} (${guild.id})` : serverId;
        });

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");

        embed.setFields([
            {
                name: "— Blacklisted Servers",
                value: guildNames.join("\n"),
            },
        ]);

        return await message.reply({ embeds: [embed] });
    }

    public async messageServerAdd(message: Message, args: Args): Promise<Message> {
        const guild = await args.pick("guild").catch(() => message.guild);

        if (!guild) {
            return await message.reply({
                content: "¯(°_o)/¯ I couldn't find the server you're looking for!",
            });
        }

        const isBlacklisted: boolean = await this.container.services.blacklist.isServerBlacklisted(guild.id);

        if (isBlacklisted) {
            return await message.reply({
                content: "(゜-゜) This server is already blacklisted!",
            });
        }

        await this.container.services.blacklist.blacklistServer(guild.id);

        return await message.reply({
            content: "(๑>ᗜºั) Successfully blacklisted this server!",
        });
    }

    public async messageServerRemove(message: Message, args: Args): Promise<Message> {
        const guild = await args.pick("guild").catch(() => message.guild);

        if (!guild) {
            return await message.reply({
                content: "¯(°_o)/¯ I couldn't find the server you're looking for!",
            });
        }

        const isBlacklisted: boolean = await this.container.services.blacklist.isServerBlacklisted(guild.id);

        if (!isBlacklisted) {
            return await message.reply({
                content: "(゜-゜) This server is not blacklisted!",
            });
        }

        await this.container.services.blacklist.unblacklistServer(guild.id);

        return await message.reply({
            content: "(๑>ᗜºั) Successfully unblacklisted this server!",
        });
    }
}
