import { DEVELOPERS } from "@/internal/constants/developers";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
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
                  message: "This command is only available to developers.",
                  identifier: ImperiaIdentifiers.DeveloperOnly,
              });
    }
}
