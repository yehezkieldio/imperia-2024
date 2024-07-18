import { CommandUtils } from "@/internal/utils/command-utils";
import type { ListenerOptions } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";

export abstract class ImperiaListener extends Listener {
    protected constructor(context: Listener.LoaderContext, options: ListenerOptions) {
        super(context, {
            ...options,
        });
    }

    protected utils: CommandUtils = new CommandUtils();
}

export declare namespace ImperiaListener {
    type Options = ListenerOptions;
    type JSON = Listener.JSON;
    type Context = Listener.LoaderContext;
}
