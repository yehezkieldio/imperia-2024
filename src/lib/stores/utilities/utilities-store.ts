import { Utility } from "@/lib/stores/utilities/utility";
import { Store } from "@sapphire/framework";

export class UtilitiesStore extends Store<Utility, "utilities"> {
    public constructor() {
        super(Utility, { name: "utilities" });
    }
}
