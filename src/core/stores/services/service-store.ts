import { Service } from "@core/stores/services/service";
import { Store } from "@sapphire/pieces";

export class ServicesStore extends Store<Service, "services"> {
    public constructor() {
        super(Service, { name: "services" });
    }
}
