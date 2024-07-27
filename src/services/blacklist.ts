import { Service } from "@/lib/stores/services";

export class BlacklistService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    public async getServers(): Promise<string[]> {
        const blacklistedServers: string[] = await this.container.db.dragonfly.smembers("blacklist:server");

        return blacklistedServers;
    }

    public async getUsers(): Promise<string[]> {
        const blacklistedUsers: string[] = await this.container.db.dragonfly.smembers("blacklist:user");

        return blacklistedUsers;
    }

    public async isServerBlacklisted(serverId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.db.dragonfly.sismember("blacklist:server", serverId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }

    public async isUserBlacklisted(userId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.db.dragonfly.sismember("blacklist:user", userId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }

    public async blacklistServer(serverId: string): Promise<void> {
        await this.container.db.dragonfly.sadd("blacklist:server", serverId);
    }

    public async blacklistUser(userId: string): Promise<void> {
        await this.container.db.dragonfly.sadd("blacklist:user", userId);
    }

    public async unblacklistServer(serverId: string): Promise<void> {
        await this.container.db.dragonfly.srem("blacklist:server", serverId);
    }

    public async unblacklistUser(userId: string): Promise<void> {
        await this.container.db.dragonfly.srem("blacklist:user", userId);
    }
}
