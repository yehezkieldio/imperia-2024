import { db } from "@/internal/database/connection";
import { users } from "@/internal/database/schema";
import { checkIfUserExists } from "@/internal/database/utils";
import type { ChatInputCommand } from "@sapphire/framework";
import { Subcommand, type SubcommandOptions } from "@sapphire/plugin-subcommands";

export abstract class ImperiaCommand extends Subcommand {
    protected constructor(context: Subcommand.LoaderContext, options: SubcommandOptions) {
        super(context, {
            ...options,
        });
    }

    /**
     * We check if the user exists in the database.
     * If it does, we check if the user has the responsePrivacy flag set to true.
     * If it does, we return true.
     * If it doesn't, we return false.
     *
     * We do this here instead of a pre-condition because we want to return something rather than true/false checks.
     */
    public async isEphemeralResponse(userId: string): Promise<boolean> {
        if (await checkIfUserExists(userId)) {
            const [result] = await db.select().from(users);

            if (result.responsePrivacy) return true;
        }

        return false;
    }

    // @ts-expect-error: Promise<unknown> instead of Promise<void>
    public async chatInputRun(
        interaction: ChatInputCommand.Interaction,
        context: ChatInputCommand.RunContext,
    ): Promise<unknown> {
        return super.chatInputRun(interaction, context);
    }
}

export declare namespace ImperiaCommand {
    type Options = SubcommandOptions;
    type JSON = Subcommand.JSON;
    type Context = Subcommand.LoaderContext;
    type RunInTypes = Subcommand.RunInTypes;
    type ChatInputCommandInteraction = Subcommand.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Subcommand.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Subcommand.AutocompleteInteraction;
    type Registry = Subcommand.Registry;
}
