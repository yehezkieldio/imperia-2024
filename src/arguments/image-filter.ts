import { ImperiaResolvers } from "@/core/extensions/resolvers";
import { ImperiaIdentifiers } from "@/core/types/identifiers";
import { Argument } from "@sapphire/framework";

export class ImageFilterArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "imageFilter" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const filter = ImperiaResolvers.resolveImageFilter(argument);

        if (filter.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: `Available filters: ${filter.unwrapErr().join(", ")}`,
                identifier: ImperiaIdentifiers.ArgumentFilterImageError,
            });
        }

        return this.ok(filter.unwrap());
    }
}
