import { blacklists, users } from "@/lib/databases/postgres/schema";
import { Repository } from "@/lib/stores/repository";
import { eq } from "drizzle-orm";

type SelectUser = typeof users.$inferSelect;
type SelectBlacklist = typeof blacklists.$inferSelect;

export class UsersRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "users",
        });
    }

    public async getUserByDiscordId(discordId: string): Promise<SelectUser> {
        const [user] = await this.container.database.select().from(users).where(eq(users.discordId, discordId));

        return user as SelectUser;
    }

    public async checkIfUserExists(discordId: string): Promise<boolean> {
        const user: SelectUser = await this.getUserByDiscordId(discordId);

        if (!user) return false;
        return true;
    }

    public async createNewUser(discordId: string): Promise<boolean> {
        const [entry] = await this.container.database
            .insert(users)
            .values({
                discordId,
            })
            .returning();

        if (!entry) return false;
        return true;
    }

    public async getOrCreateUser(discordId: string): Promise<SelectUser> {
        const user: SelectUser = await this.getUserByDiscordId(discordId);

        if (!user) {
            await this.createNewUser(discordId);
            return await this.getUserByDiscordId(discordId);
        }

        return user;
    }

    /* -------------------------------- BLACKLIST ------------------------------- */

    public async blacklistUser(discordId: string): Promise<boolean> {
        const [existingEntry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (existingEntry) return false;

        const [entry] = await this.container.database
            .insert(blacklists)
            .values({
                blacklistId: discordId,
                blacklistType: "user",
            })
            .returning();

        return !!entry;
    }

    public async unblacklistUser(discordId: string): Promise<boolean> {
        const [existingEntry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (!existingEntry) return false;

        await this.container.database.delete(blacklists).where(eq(blacklists.blacklistId, discordId));

        return true;
    }

    public async getBlacklistedUsers(): Promise<string[]> {
        const blacklistedUsers: SelectBlacklist[] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistType, "user"));

        return blacklistedUsers.map((user) => user.blacklistId);
    }

    public async isUserBlacklisted(discordId: string): Promise<boolean> {
        const [entry] = await this.container.database
            .select()
            .from(blacklists)
            .where(eq(blacklists.blacklistId, discordId));

        if (!entry) return false;
        return true;
    }
}
