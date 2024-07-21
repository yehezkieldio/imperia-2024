import { type CommandStatus, commandHistory } from "@/~schema";
import { Utility } from "@sapphire/plugin-utilities-store";

interface AddCommandHistoryOptions {
    userId: string;
    guildId: string;
    commandName: string;
    status: CommandStatus;
}

export class CommandHistoryRepository extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "historyRepo",
        });
    }

    public async addCommandHistory({
        userId,
        guildId,
        commandName,
        status,
    }: AddCommandHistoryOptions): Promise<boolean> {
        const [entry] = await this.container.database
            .insert(commandHistory)
            .values({
                userId: userId,
                guildId: guildId,
                commandName: commandName,
                status: status,
            })
            .returning();

        if (!entry) return false;
        return true;
    }
}
