import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { ImperiaResolvers } from "@/lib/extensions/resolvers";
import { Argument, type Result } from "@sapphire/framework";

export class ImageEffectArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "imageEffect" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const effect: Result<string, string[]> = ImperiaResolvers.resolveImageEffect(argument);

        if (effect.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: `Available effects: ${effect.unwrapErr().join(", ")}`,
                identifier: ImperiaIdentifiers.ArgumentEffectImageError,
            });
        }

        return this.ok(effect.unwrap());
    }
}
