import { DEVELOPERS } from "@/core/constants";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import { Precondition, type PreconditionResult, type Result, type UserError } from "@sapphire/framework";
import type { CommandInteraction, Message } from "discord.js";

export class DeveloperOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
        return this.check(interaction);
    }

    public override async messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.check(message);
    }

    private check(context: CommandInteraction | Message): PreconditionResult {
        const userId: string | undefined = context.member?.user.id as string;

        return DEVELOPERS.includes(userId)
            ? this.ok()
            : this.error({
                  identifier: ImperiaIdentifiers.DeveloperOnly,
                  message: "Congratulations! You've found a developer command. Unfortunately, you're not a developer.",
              });
    }
}
