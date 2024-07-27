import { DEVELOPERS } from "@/lib/const";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { Precondition, type Result, type UserError } from "@sapphire/framework";
import type { CommandInteraction, Message } from "discord.js";

export class DeveloperOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doDevelopersCheck(interaction.user.id);
    }

    public async messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doDevelopersCheck(message.author.id);
    }

    private async doDevelopersCheck(userId: string): Promise<Result<unknown, UserError>> {
        return DEVELOPERS.includes(userId)
            ? this.ok()
            : this.error({
                  message: "┗(･ω･;)┛ My apologies, but this command is for developers only!",
                  identifier: ImperiaIdentifiers.DeveloperOnly,
              });
    }
}
