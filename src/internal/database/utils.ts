import { db } from "@/internal/database/connection";
import { commandUsage, commandUsageStatus as commandUsageStatusEnum, users } from "@/internal/database/schema";
import { z } from "zod";

const statusSchema = z.enum(commandUsageStatusEnum.enumValues);
export type CommandUsageStatus = z.infer<typeof statusSchema>;

const gameStatusSchema = z.enum(["IN_PROGRESS", "WIN", "DRAW"]);
export type GameStatus = z.infer<typeof gameStatusSchema>;

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

export async function checkIfUserExists(userId: string) {
    const result = await db.select().from(users);
    return result.length > 0;
}
