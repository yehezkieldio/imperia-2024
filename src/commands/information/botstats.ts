import { RegisterBehavior, UserError } from "@sapphire/framework";
import { SlashCommandBuilder, codeBlock } from "discord.js";

import type { APIEmbedField } from "discord.js";

import { db } from "@/internal/database/connection";
import { commandUsage } from "@/internal/database/schema";
import { ImperiaCommand } from "@/internal/extensions/command";
import { ImperiaEmbedBuilder } from "@/internal/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { msToTime } from "@/internal/utils/time-utils";
import { count } from "drizzle-orm";

export class BotStatisticsCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "View statistics of the bot.",
            requiredClientPermissions: ["SendMessages"],
            preconditions: ["GuildOnly"],
            ...options,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const fieldResponses: APIEmbedField[] = await this.getFieldResponses(interaction);

        if (!interaction.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        const response = new ImperiaEmbedBuilder().setFields([...fieldResponses]);

        if (interaction.guild.iconURL({ size: 4096 }) === null) {
            response.setAuthor({ name: interaction.guild.name });
        } else {
            response.setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ size: 4096 }) ?? "",
            });
        }

        return interaction.reply({
            embeds: [response],
            ephemeral: await ImperiaCommand.isEphemeralResponse(interaction.user.id),
        });
    }

    private async getBotInformation(ctx: ImperiaCommand.ChatInputCommandInteraction) {
        if (!ctx.guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        return {
            uptime: msToTime(this.container.client.uptime as number),
            statistic: {
                commands: this.container.stores.get("commands").size,
                commandsExecuted: await db.select({ value: count() }).from(commandUsage),
            },
            memory: {
                used: process.memoryUsage().heapUsed / 1024 / 1024,
                total: process.memoryUsage().heapTotal / 1024 / 1024,
            },
        };
    }

    private async getFieldResponses(ctx: ImperiaCommand.ChatInputCommandInteraction) {
        const { uptime, statistic, memory } = await this.getBotInformation(ctx);

        const uptimeBlock: string[] = [`Uptime          :  ${uptime}`];

        const info: string[] = [
            `Commands        :  ${statistic.commands}`,
            `Commands Ran    :  ${statistic.commandsExecuted[0].value}`,
        ];

        const memoryInfo: string[] = [
            `Memory Used     :  ${memory.used.toFixed(2)} MB`,
            `Memory Total    :  ${memory.total.toFixed(2)} MB`,
        ];

        return [
            { name: "Uptime", value: codeBlock(uptimeBlock.join("\n")) },
            { name: "Bot Statistics", value: codeBlock(info.join("\n")) },
            { name: "Memory", value: codeBlock(memoryInfo.join("\n")) },
        ] as APIEmbedField[];
    }
}
