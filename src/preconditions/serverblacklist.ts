import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";

export class ServerPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 20,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId);
    }

    public override messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(message.guildId);
    }

    private async doBlacklistCheck(guildId: string | null): Promise<Result<unknown, UserError>> {
        if (guildId === null) {
            return this.ok();
        }

        const isBlacklistedGuild: boolean = await this.container.services.blacklist.isServerBlacklisted(guildId);
        if (!isBlacklistedGuild) {
            return this.ok();
        }

        return this.error({
            identifier: ImperiaIdentifiers.BlacklistedServer,
            message: "( ͒•·̫| My apologies, but this server is blacklisted, I can't execute commands here.",
        });
    }
}
