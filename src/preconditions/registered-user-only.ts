import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import { Precondition, type PreconditionResult, type Result, type UserError } from "@sapphire/framework";
import type { CommandInteraction, Message } from "discord.js";

export class RegisteredUserOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.RegisteredUserOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
        return this.check(interaction);
    }

    public override async messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.check(message);
    }

    private async check(context: CommandInteraction | Message): Promise<PreconditionResult> {
        const userId: string | undefined = context.member?.user.id as string;
        const user = await this.container.repositories.user.findOne(userId);

        if (!user) {
            return this.error({
                identifier: ImperiaIdentifiers.RegisteredUserOnly,
                message: "Please `/register` an account with Imperia before using this command!",
            });
        }

        return this.ok();
    }
}
