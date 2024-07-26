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
}
