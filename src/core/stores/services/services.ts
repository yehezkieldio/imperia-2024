import type { Service } from "@core/stores/services/service";
import { ServicesStore } from "@core/stores/services/service-store";
import { container } from "@sapphire/framework";

export class Services {
    public readonly store: ServicesStore;

    public constructor() {
        container.services = this;
        this.store = new ServicesStore();
    }

    public exposePiece(name: string, piece: Service) {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}
