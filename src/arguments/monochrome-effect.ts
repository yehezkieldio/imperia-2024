import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { ImperiaResolvers } from "@/lib/extensions/resolvers";
import { Argument, type Result } from "@sapphire/framework";

export class MonochromeEffectArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "monochromeEffect" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const monochrome: Result<string, string[]> = ImperiaResolvers.resolveMonochromeEffect(argument);

        if (monochrome.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: `Available monochrome effects: ${monochrome.unwrapErr().join(", ")}`,
                identifier: ImperiaIdentifiers.ArgumentEffectMonochromeError,
            });
        }

        return this.ok(monochrome.unwrap());
    }
}
