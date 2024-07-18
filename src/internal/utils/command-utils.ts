import { users } from "@/internal/database/postgres/schema";
import { type Container, container as c } from "@sapphire/framework";

export class CommandUtils {
    private container: Container = c;

    public async responsePrivacy(userId: string): Promise<boolean> {
        const [user] = await this.container.db.select().from(users);
        if (!user) return false;

        return Boolean(user.responsePrivacy);
    }

    public randomizeArray<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}
