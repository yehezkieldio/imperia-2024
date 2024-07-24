import type { Service } from "@/core/stores/services/service";
import { ServicesStore } from "@/core/stores/services/services-store";
import { container } from "@sapphire/pieces";

export class Services {
    public readonly store: ServicesStore;

    public constructor() {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        container.services = this;
        this.store = new ServicesStore();
    }

    public exposePiece(name: string, piece: Service) {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}
