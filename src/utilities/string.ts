import { Utility } from "@/lib/stores/utilities";

export class StringUtilities extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "string",
        });
    }

    public trim(str: string, length: number): string {
        return str.length > length ? `${str.substring(0, length)}` : str;
    }

    public convertToSpaced(str: string): string {
        return str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}
