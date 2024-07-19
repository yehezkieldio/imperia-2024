import { users } from "@/internal/database/postgres/schema";
import { ImperiaIdentifiers } from "@/internal/extensions/identifiers";
import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export class RegisteredUserOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.RegisteredUserOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const result = await this.container.db.select().from(users).where(eq(users.discordId, interaction.user.id));

        return result.length === 0
            ? this.error({
                  message: "You must be a registered user to use this command.",
                  identifier: ImperiaIdentifiers.RegisteredUserOnly,
              })
            : this.ok();
    }
}
