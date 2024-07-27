import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";

export class UserPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 21,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.user.id);
    }

    public override messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(message.author.id);
    }

    private async doBlacklistCheck(userId: string | null): Promise<Result<unknown, UserError>> {
        if (userId === null) {
            return this.ok();
        }

        const isBlacklistedUser: boolean = await this.container.services.blacklist.isUserBlacklisted(userId);
        if (!isBlacklistedUser) {
            return this.ok();
        }

        return this.error({
            identifier: ImperiaIdentifiers.BlacklistedUser,
            message: ">⌓<｡ My apologies, but you are blacklisted! I can't execute commands for you. ( .. )",
        });
    }
}
