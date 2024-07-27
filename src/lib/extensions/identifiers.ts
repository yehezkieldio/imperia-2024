import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "registeredUserOnly",
    DeveloperOnly = "developerOnly",
    BlacklistedServer = "blacklistedServer",
    CommandServiceError = "commandServiceError",
    RequestResultError = "requestResultError",
    ArgumentFilterImageError = "argumentFilterImageError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
};
