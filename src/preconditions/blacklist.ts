import { ImperiaIdentifiers } from "@/lib/extensions/constants/identifiers";
import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";

export class BlacklistPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 20,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.user.id, interaction.guildId);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.user.id, interaction.guildId);
    }

    public override messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(message.author.id, message.guildId);
    }

    private async doBlacklistCheck(userId: string, serverId: string | null): Promise<Result<unknown, UserError>> {
        if (serverId === null) {
            return this.ok();
        }

        const isUserBlacklisted: boolean = await this.isUserBlacklisted(userId);
        if (isUserBlacklisted) {
            return this.error({
                identifier: ImperiaIdentifiers.BlacklistedUser,
                message: "My apologies! But you are blacklisted from utilizing my services.",
            });
        }

        const isServerBlacklisted: boolean = await this.isServerBlacklisted(serverId);
        if (isServerBlacklisted) {
            return this.error({
                identifier: ImperiaIdentifiers.BlacklistedServer,
                message: "My apologies! But this server is blacklisted from utilizing my services.",
            });
        }

        return this.ok();
    }

    private async isServerBlacklisted(serverId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.datastore.sismember("bot:blacklist:server", serverId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }

    private async isUserBlacklisted(userId: string): Promise<boolean> {
        const isBlacklisted: number = await this.container.datastore.sismember("bot:blacklist:user", userId);
        if (isBlacklisted === 1) {
            return true;
        }

        return false;
    }
}
