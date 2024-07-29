import { Service } from "@/lib/stores/services";

export class BlacklistService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    #serverBlacklistKey = "blacklist:server";
    #userBlacklistKey = "blacklist:user";

    public async getServers(): Promise<string[]> {
        const blacklistedServers: string[] = await this.container.db.dragonfly.smembers(this.#serverBlacklistKey);

        return blacklistedServers;
    }

    public async getUsers(): Promise<string[]> {
        const blacklistedUsers: string[] = await this.container.db.dragonfly.smembers(this.#userBlacklistKey);

        return blacklistedUsers;
    }

    public async isServerBlacklisted(serverId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.db.dragonfly.sismember(this.#serverBlacklistKey, serverId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }

    public async isUserBlacklisted(userId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.db.dragonfly.sismember(this.#userBlacklistKey, userId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }

    public async blacklistServer(serverId: string): Promise<void> {
        await this.container.db.dragonfly.sadd(this.#serverBlacklistKey, serverId);
    }

    public async blacklistUser(userId: string): Promise<void> {
        await this.container.db.dragonfly.sadd(this.#userBlacklistKey, userId);
    }

    public async unblacklistServer(serverId: string): Promise<void> {
        await this.container.db.dragonfly.srem(this.#serverBlacklistKey, serverId);
    }

    public async unblacklistUser(userId: string): Promise<void> {
        await this.container.db.dragonfly.srem(this.#userBlacklistKey, userId);
    }
}
