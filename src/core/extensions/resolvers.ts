import { Resolvers } from "@/core/resolvers/image-filter";
import { Resolvers as SapphireResolvers } from "@sapphire/framework";

type ImperiaResolvers = typeof SapphireResolvers & typeof Resolvers;

export const resolvers: ImperiaResolvers = {
    ...SapphireResolvers,
    ...Resolvers,
};
