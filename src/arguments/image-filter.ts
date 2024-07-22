import { resolvers } from "@/core/extensions/resolvers";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import { Argument } from "@sapphire/framework";

export class ImageFilterArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "imageFilter" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const filter = resolvers.resolveImageFilter(argument);

        if (filter.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: `The filter provided was not found!\nAvailable filters: ${filter.unwrapErr().join(", ")}`,
                identifier: ImperiaIdentifiers.ArgumentFilterImageError,
            });
        }

        return this.ok(filter.unwrap());
    }
}
