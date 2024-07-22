import { Resolvers } from "@/core/resolvers/image-filter";
import { Resolvers as SapphireResolvers } from "@sapphire/framework";

type imperiaResolvers = typeof SapphireResolvers & typeof Resolvers;

export const ImperiaResolvers: imperiaResolvers = {
    ...SapphireResolvers,
    ...Resolvers,
};
