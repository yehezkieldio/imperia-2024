import type {} from "@/lib/databases/postgres/schema";
import { Service } from "@/lib/stores/service";

export class ResponseService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "response",
        });
    }
}
