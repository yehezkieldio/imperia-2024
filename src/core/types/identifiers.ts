import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";

enum Identifiers {
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperOnly = "DeveloperOnly",
    CommandServiceError = "CommandServiceError",
    RequestResultError = "RequestResultError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...Identifiers,
} as const;
