import { Events as SapphireEvents } from "@sapphire/framework";
import { SubcommandPluginEvents } from "@sapphire/plugin-subcommands";

const Events = {
    DragonflyReady: "dragonflyReady",
};

export const ImperiaEvents = {
    ...SapphireEvents,
    ...SubcommandPluginEvents,
    ...Events,
};
