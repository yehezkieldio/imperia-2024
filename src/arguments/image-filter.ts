import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import { ImperiaResolvers } from "@/core/extensions/resolvers";
import { Argument, type Result } from "@sapphire/framework";

export class ImageFilterArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "imageFilter" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const filter: Result<string, string[]> = ImperiaResolvers.resolveImageFilter(argument);

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
