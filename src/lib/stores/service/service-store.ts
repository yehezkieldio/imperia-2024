import { Service } from "@/lib/stores/service/service";
import { Store } from "@sapphire/framework";

export class ServicesStore extends Store<Service, "services"> {
    public constructor() {
        super(Service, { name: "services" });
    }
}
