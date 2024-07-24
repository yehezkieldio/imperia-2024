import { RepositoriesStore } from "@/core/stores/repositories/repositories-store";
import type { Repository } from "@/core/stores/repositories/repository";
import { container } from "@sapphire/pieces";

export class Repositories {
    public readonly store: RepositoriesStore;

    public constructor() {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        container.repositories = this;
        this.store = new RepositoriesStore();
    }

    public exposePiece(name: string, piece: Repository) {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}
