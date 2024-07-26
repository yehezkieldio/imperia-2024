import { commandHistory } from "@/lib/databases/postgres/schema";
import type { CommandStatus, CommandType } from "@/lib/databases/postgres/util";
import { Repository } from "@/lib/stores/repositories";

interface AddCommandHistoryOptions {
    userId: string;
    guildId: string;
    commandName: string;
    status: CommandStatus;
    type: CommandType;
}

export class CommandHistoryRepository extends Repository {
    public constructor(context: Repository.LoaderContext, options: Repository.Options) {
        super(context, {
            ...options,
            name: "user",
        });
    }

    public async addCommandHistory(options: AddCommandHistoryOptions) {
        const [entry] = await this.container.db.postgres
            .insert(commandHistory)
            .values({
                userId: options.userId,
                guildId: options.guildId,
                commandName: options.commandName,
                status: options.status,
                type: options.type,
            })
            .returning();

        if (!entry) return null;
        return entry;
    }
}
