import { users } from "@/lib/databases/postgres/schema";
import { Repository } from "@/lib/stores/repositories";
import { eq } from "drizzle-orm";

export class UserRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "user",
        });
    }

    public async findOne(userId: string) {
        const user = await this.container.db.postgres.select().from(users).where(eq(users.discordId, userId));

        if (!user) return null;
        return user;
    }

    public async create(discordId: string) {
        const [user] = await this.container.db.postgres
            .insert(users)
            .values({
                discordId: discordId,
            })
            .returning();

        if (!user) return null;
        return user;
    }
}
