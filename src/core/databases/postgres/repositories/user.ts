import { users } from "@/core/databases/postgres/schema";
import { Repository } from "@/core/stores/repositories/repository";
import { eq } from "drizzle-orm";

export class UserRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "user",
        });
    }

    public async findOne(userId: string) {
        const user = await this.container.database.postgres.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) return null;
        return user;
    }
}
