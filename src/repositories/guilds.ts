import { blacklists, guilds } from "@/lib/databases/postgres/schema";
import { Repository } from "@/lib/stores/repository";
import { eq } from "drizzle-orm";

type SelectGuild = typeof guilds.$inferSelect;
type SelectBlacklist = typeof blacklists.$inferSelect;

export class GuildsRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "guilds",
        });
    }

    public async getGuildByDiscordId(discordId: string): Promise<SelectGuild> {
        const [guild] = await this.container.database.select().from(guilds).where(eq(guilds.discordId, discordId));

        return guild as SelectGuild;
    }

    public async checkIfGuildExists(discordId: string): Promise<boolean> {
        const guild: SelectGuild = await this.getGuildByDiscordId(discordId);

        if (!guild) return false;
        return true;
    }

    public async createNewGuild(discordId: string): Promise<boolean> {
        const [entry] = await this.container.database
            .insert(guilds)
            .values({
                discordId,
            })
            .returning();

        if (!entry) return false;
        return true;
    }

    public async getOrCreateGuild(discordId: string): Promise<SelectGuild> {
        const guild: SelectGuild = await this.getGuildByDiscordId(discordId);

        if (!guild) {
            await this.createNewGuild(discordId);
            return await this.getGuildByDiscordId(discordId);
        }

        return guild;
    }

    /* -------------------------------- BLACKLIST ------------------------------- */

    public async blacklistGuild(discordId: string): Promise<boolean> {
        const [existingEntry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (existingEntry) return false;

        const [entry] = await this.container.database
            .insert(blacklists)
            .values({
                blacklistId: discordId,
                blacklistType: "guild",
            })
            .returning();

        return !!entry;
    }

    public async unblacklistGuild(discordId: string): Promise<boolean> {
        const [existingEntry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (!existingEntry) return false;

        await this.container.database.delete(blacklists).where(eq(blacklists.blacklistId, discordId));

        return true;
    }

    public async getBlacklistedGuilds(): Promise<string[]> {
        const blacklistedUsers: SelectBlacklist[] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistType, "guild"));

        return blacklistedUsers.map((user) => user.blacklistId);
    }

    public async isGuildBlacklisted(discordId: string): Promise<boolean> {
        const [entry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (!entry) return false;
        return true;
    }

    /* ---------------------------- COMMAND DISABLING --------------------------- */

    public async getCommandsDisabled(discordId: string): Promise<string[]> {
        const guild: SelectGuild = await this.getGuildByDiscordId(discordId);

        return guild.commandsDisabled;
    }

    public async addCommandToDisabledList(discordId: string, command: string): Promise<boolean> {
        const guild: SelectGuild = await this.getGuildByDiscordId(discordId);

        if (guild.commandsDisabled.includes(command)) return false;

        guild.commandsDisabled.push(command);

        await this.container.database
            .update(guilds)
            .set({
                commandsDisabled: guild.commandsDisabled,
            })
            .where(eq(guilds.discordId, discordId));

        return true;
    }

    public async removeCommandFromDisabledList(discordId: string, command: string): Promise<boolean> {
        const guild: SelectGuild = await this.getGuildByDiscordId(discordId);

        if (!guild.commandsDisabled.includes(command)) return false;

        guild.commandsDisabled = guild.commandsDisabled.filter((c) => c !== command);

        await this.container.database
            .update(guilds)
            .set({
                commandsDisabled: guild.commandsDisabled,
            })
            .where(eq(guilds.discordId, discordId));

        return true;
    }

    public async clearDisabledCommands(discordId: string): Promise<boolean> {
        await this.container.database
            .update(guilds)
            .set({
                commandsDisabled: [],
            })
            .where(eq(guilds.discordId, discordId));

        return true;
    }
}
