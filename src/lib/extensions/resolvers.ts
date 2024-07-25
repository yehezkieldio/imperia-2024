import { Resolvers } from "@/lib/resolvers/image-filter";
import { Resolvers as SapphireResolvers } from "@sapphire/framework";

type CombinedResolvers = typeof Resolvers & typeof SapphireResolvers;

export const ImperiaResolvers: CombinedResolvers = {
    ...SapphireResolvers,
    ...Resolvers,
};
