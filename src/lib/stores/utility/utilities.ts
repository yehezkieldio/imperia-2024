import { container } from "@sapphire/pieces";
import { UtilitiesStore } from "./utilities-store";
import type { Utility } from "./utility";

export class Utilities {
    public readonly store: UtilitiesStore;

    public constructor() {
        //@ts-ignore Bypass TypeScript check for dynamic property assignment
        container.utilities = this;
        this.store = new UtilitiesStore();
    }

    public exposePiece(name: string, piece: Utility): void {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}
