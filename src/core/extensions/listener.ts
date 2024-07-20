import type { ListenerOptions } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";

/**
 * The base class for all listeners in the bot.
 */
export abstract class ImperiaListener extends Listener {
    protected constructor(context: Listener.LoaderContext, options: ListenerOptions) {
        super(context, {
            ...options,
        });
    }
}

export declare namespace ImperiaListener {
    type Options = ListenerOptions;
    type JSON = Listener.JSON;
    type Context = Listener.LoaderContext;
}
