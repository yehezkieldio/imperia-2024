import { users } from "@/~schema";
import { Utility } from "@sapphire/plugin-utilities-store";
import { eq } from "drizzle-orm";

export class UserRepository extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "userRepo",
        });
    }

    public async findOne(userId: string) {
        const user = await this.container.database.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) return null;
        return user;
    }
}
