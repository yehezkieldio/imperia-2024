import { Service } from "@/core/stores/services/service";
import { Store } from "@sapphire/pieces";

export class UtilitiesStore extends Store<Service, "utilities"> {
    public constructor() {
        super(Service, { name: "utilities" });
    }
}
