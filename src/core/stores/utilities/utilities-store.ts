import { Store } from "@sapphire/pieces";
import { Utility } from "./utility";

export class UtilitiesStore extends Store<Utility, "utilities"> {
    public constructor() {
        super(Utility, { name: "utilities" });
    }
}
