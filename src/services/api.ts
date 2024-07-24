import { Service } from "@/core/stores/services/service";

export class ApiService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "api",
        });
    }
}
