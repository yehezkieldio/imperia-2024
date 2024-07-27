import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperOnly = "DeveloperOnly",
    BlacklistedServer = "blacklistedServer",
    BlacklistedUser = "blacklistedUser",
    PerServerCommandDisabled = "perServerCommandDisabled",
    // For passing but invalid arguments. Ex: Trying to ban yourself or the bot.
    InvalidArgumentProvided = "invalidArgumentProvided",
    // For services that are not available or errored out, a bit verbose but usually for internal services or commands.
    CommandServiceError = "commandServiceError",
    // For external APIs that are not available or errored out. Ex: No random cats available.
    RequestResultError = "requestResultError",
    ArgumentFilterImageError = "argumentFilterImageError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
};
