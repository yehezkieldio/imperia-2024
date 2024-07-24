import { commandHistory } from "@/core/databases/postgres/schema";
import type { CommandStatus, CommandType } from "@/core/databases/postgres/utils";
import { Repository } from "@/core/stores/repositories/repository";

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
            name: "commandHistory",
        });
    }

    public async addCommandHistory({
        userId,
        guildId,
        commandName,
        status,
        type,
    }: AddCommandHistoryOptions): Promise<boolean> {
        const [entry] = await this.container.database.postgres
            .insert(commandHistory)
            .values({
                userId: userId,
                guildId: guildId,
                commandName: commandName,
                status: status,
                type: type,
            })
            .returning();

        if (!entry) return false;
        return true;
    }
}
