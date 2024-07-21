import { Command, type CommandOptions } from "@sapphire/framework";

export abstract class ImperiaCommand extends Command {
    protected constructor(context: Command.LoaderContext, options: CommandOptions) {
        super(context, {
            ...options,
        });
    }
}

export declare namespace ImperiaCommand {
    type Options = CommandOptions;
    type JSON = Command.JSON;
    type Context = Command.LoaderContext;
    type RunInTypes = Command.RunInTypes;
    type ChatInputCommandInteraction = Command.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Command.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Command.AutocompleteInteraction;
    type Registry = Command.Registry;
}
