import { Utility } from "@/lib/stores/utility/utility";
import { Store } from "@sapphire/framework";

export class UtilitiesStore extends Store<Utility, "utilities"> {
    public constructor() {
        super(Utility, { name: "utilities" });
    }
}
