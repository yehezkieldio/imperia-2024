import { db } from "@/internal/database/connection";
import { commandUsage, commandUsageStatus as commandUsageStatusEnum } from "@/internal/database/schema";
import { z } from "zod";

/**
 * TODO: Find a better way to handle this.
 */
const statusSchema = z.enum(commandUsageStatusEnum.enumValues);
export type CommandUsageStatus = z.infer<typeof statusSchema>;

interface CommandUsageEntry {
    commandName: string;
    userId: string;
    guildId: string;
    status: CommandUsageStatus;
}

export async function newCommandUsageEntry({ commandName, userId, guildId, status }: CommandUsageEntry) {
    await db.insert(commandUsage).values({
        command: commandName,
        discordId: userId,
        guildId: guildId,
        status: status,
        timestamp: new Date(),
    });
}
