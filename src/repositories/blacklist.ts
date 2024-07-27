import { blacklistEntity } from "@/lib/databases/postgres/schema";
import type { BlacklistType } from "@/lib/databases/postgres/util";
import { Repository } from "@/lib/stores/repositories";
import { eq } from "drizzle-orm";

export interface BlacklistEntity {
    entityId: string;
    entityType: BlacklistType;
}

export class BlacklistRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    public async create(entityId: string, entityType: BlacklistType) {
        const [blacklistEntry] = await this.container.db.postgres
            .insert(blacklistEntity)
            .values({
                entityId: entityId,
                entityType: entityType,
            })
            .returning();

        if (!blacklistEntry) return false;
        return true;
    }

    public async createBulk(entities: BlacklistEntity[]) {
        const blacklistEntries = await this.container.db.postgres.insert(blacklistEntity).values(entities).returning();

        if (!blacklistEntries) return false;
        return true;
    }

    public async createUsers(users: string[]) {
        const entities = users.map((user) => ({ entityId: user, entityType: "user" as BlacklistType }));
        return await this.createBulk(entities);
    }

    public async createServers(servers: string[]) {
        const entities = servers.map((server) => ({ entityId: server, entityType: "guild" as BlacklistType }));
        return await this.createBulk(entities);
    }

    public async getUsers() {
        const users = await this.container.db.postgres
            .select()
            .from(blacklistEntity)
            .where(eq(blacklistEntity.entityType, "user"));

        if (!users) return [];
        return users.map((user) => user.entityId);
    }

    public async getServers() {
        const servers = await this.container.db.postgres
            .select()
            .from(blacklistEntity)
            .where(eq(blacklistEntity.entityType, "guild"));

        if (!servers) return [];
        return servers.map((server) => server.entityId);
    }

    public async deleteUsers() {
        const users = await this.container.db.postgres
            .delete(blacklistEntity)
            .where(eq(blacklistEntity.entityType, "user"));

        if (!users) return false;
        return true;
    }

    public async deleteServers() {
        const servers = await this.container.db.postgres
            .delete(blacklistEntity)
            .where(eq(blacklistEntity.entityType, "guild"));

        if (!servers) return false;
        return true;
    }
}
