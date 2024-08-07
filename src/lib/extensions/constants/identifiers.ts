import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "registeredUserOnly",
    DeveloperUserOnly = "developerUserOnly",
    BlacklistedServer = "blacklistedServer",
    BlacklistedUser = "blacklistedUser",
    PerServerCommandDisabled = "perServerCommandDisabled",
    InvalidArgumentProvided = "invalidArgumentProvided",
    CommandServiceError = "commandServiceError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
};
