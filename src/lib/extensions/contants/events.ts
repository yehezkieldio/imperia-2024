import { Events as SapphireEvents } from "@sapphire/framework";
import { SubcommandPluginEvents } from "@sapphire/plugin-subcommands";

const Events = {
    DragonflyReady: "ready",
};

export const ImperiaEvents = {
    ...SapphireEvents,
    ...SubcommandPluginEvents,
    ...Events,
};
