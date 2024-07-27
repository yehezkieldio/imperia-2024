import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperOnly = "DeveloperOnly",
    BlacklistedServer = "blacklistedServer",
    BlacklistedUser = "blacklistedUser",
    PerServerCommandDisabled = "perServerCommandDisabled",
    HiddenCommand = "hiddenCommand",
    CommandServiceError = "commandServiceError",
    RequestResultError = "requestResultError",
    ArgumentFilterImageError = "argumentFilterImageError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
};
