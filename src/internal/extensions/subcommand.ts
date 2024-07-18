import { CommandUtils } from "@/internal/utils/command-utils";
import { Subcommand, type SubcommandOptions } from "@sapphire/plugin-subcommands";

export abstract class ImperiaSubcommand extends Subcommand {
    protected constructor(context: Subcommand.LoaderContext, options: SubcommandOptions) {
        super(context, {
            ...options,
        });
    }

    protected utils: CommandUtils = new CommandUtils();
}

export declare namespace ImperiaSubcommand {
    type Options = SubcommandOptions;
    type JSON = Subcommand.JSON;
    type Context = Subcommand.LoaderContext;
    type RunInTypes = Subcommand.RunInTypes;
    type ChatInputCommandInteraction = Subcommand.ChatInputCommandInteraction;
    type ContextMenuCommandInteraction = Subcommand.ContextMenuCommandInteraction;
    type AutocompleteInteraction = Subcommand.AutocompleteInteraction;
    type Registry = Subcommand.Registry;
}
