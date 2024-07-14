import { db } from "@/internal/database/connection";
import { users } from "@/internal/database/schema";
import { ImperiaIdentifiers } from "@/internal/types/identifiers";
import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export class RegisteredUserOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const userQuery = await db.select().from(users).where(eq(users.discordId, interaction.user.id));

        return userQuery.length === 0
            ? this.error({
                  message: "You must be a registered user to use this command.",
                  identifier: ImperiaIdentifiers.RegisteredUserOnly,
              })
            : this.ok();
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        RegisteredUserOnly: never;
    }
}
