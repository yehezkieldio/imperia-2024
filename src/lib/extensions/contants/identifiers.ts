import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";
import { SubcommandPluginIdentifiers } from "@sapphire/plugin-subcommands";

enum Identifiers {
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperUserOnly = "DeveloperUserOnly",
    ServerBlacklisted = "serverBlacklisted",
    UserBlacklisted = "userBlacklisted",
    PerServerCommandDisabled = "perServerCommandDisabled",
    InvalidArgumentProvided = "invalidArgumentProvided",
    CommandServiceError = "commandServiceError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...SubcommandPluginIdentifiers,
    ...Identifiers,
};
