import type { CommandResultType, CommandType } from "@/lib/databases/postgres/schema";
import { Service } from "@/lib/stores/service";
import type { MessageChatContext } from "@/lib/typings/message-types";
import { Message } from "discord.js";

interface CreateNewCommandAnalyticsOptions {
    context: MessageChatContext;
    command: string;
    result: CommandResultType;
    type: CommandType;
}

export class AnalyticsService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "analytics",
        });
    }

    public async command(options: CreateNewCommandAnalyticsOptions): Promise<string> {
        const guildId = options.context.guild?.id as string;
        const userId: string = options.context instanceof Message ? options.context.author.id : options.context.user.id;

        const result: boolean = await this.container.repos.analytics.createNewCommandAnalytics({
            guildId,
            userId,
            command: options.command,
            result: options.result,
            type: options.type,
        });

        if (!result) return "Failed to insert a new analytics entry. Skipping...";

        return `Command ${options.result} for "${options.command}" (${options.type}) ran by "${userId}" in guild "${guildId}"`;
    }
}
