import { DEVELOPERS } from "@/config";
import { ImperiaIdentifiers } from "@/lib/extensions/constants/identifiers";
import { Precondition, type Result, type UserError } from "@sapphire/framework";
import type { CommandInteraction, Message } from "discord.js";

export class DeveloperUserOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperUserOnly,
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
                  message: "This command is restricted to my developers only! What are you trying to do?",
                  identifier: ImperiaIdentifiers.DeveloperUserOnly,
              });
    }
}
