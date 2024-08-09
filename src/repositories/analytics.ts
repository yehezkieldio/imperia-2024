import { type CommandResultType, type CommandType, commandAnalytics } from "@/lib/databases/postgres/schema";
import { Repository } from "@/lib/stores/repository";

interface CreateNewCommandAnalyticsOptions {
    userId: string;
    guildId: string;
    command: string;
    result: CommandResultType;
    type: CommandType;
}

export class AnalyticsRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "analytics",
        });
    }

    public async createNewCommandAnalytics(options: CreateNewCommandAnalyticsOptions): Promise<boolean> {
        const [entry] = await this.container.database
            .insert(commandAnalytics)
            .values({
                userId: options.userId,
                guildId: options.guildId,
                command: options.command,
                result: options.result,
                type: options.type,
            })
            .returning();

        if (!entry) return false;
        return true;
    }
}
