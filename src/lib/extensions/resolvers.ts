import {
    resolveImageEffect as IresolveImageEffect,
    resolveImageFilter as IresolveImageFilter,
    resolveMonochromeEffect as IresolveMonochromeEffect,
} from "@/lib/resolvers";
import { Resolvers as SapphireResolvers } from "@sapphire/framework";

/**
 * This works, but need to find a better way to combine the resolvers.
 */
export namespace Resolvers {
    export const resolveImageFilter = IresolveImageFilter;
    export const resolveImageEffect = IresolveImageEffect;
    export const resolveMonochromeEffect = IresolveMonochromeEffect;
}

type CombinedResolvers = typeof Resolvers & typeof SapphireResolvers;

export const ImperiaResolvers: CombinedResolvers = {
    ...SapphireResolvers,
    ...Resolvers,
};
