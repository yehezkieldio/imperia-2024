import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperOnly = "DeveloperOnly",
    SearchResultsNotFound = "SearchResultsNotFound",
    CommandServiceError = "CommandServiceError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
} as const;
