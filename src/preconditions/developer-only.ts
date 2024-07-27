import { DEVELOPERS } from "@/lib/const";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class DeveloperOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        return DEVELOPERS.includes(interaction.user.id)
            ? this.ok()
            : this.error({
                  message: "┗(･ω･;)┛ My apologies, but this command is for developers only!",
                  identifier: ImperiaIdentifiers.DeveloperOnly,
              });
    }
}
