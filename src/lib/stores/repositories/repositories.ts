import { RepositoriesStore } from "@/lib/stores/repositories/repositories-store";
import type { Repository } from "@/lib/stores/repositories/repository";
import { container } from "@sapphire/pieces";

export class Repositories {
    public readonly store: RepositoriesStore;

    public constructor() {
        //@ts-ignore Bypass TypeScript check for dynamic property assignment
        container.repos = this;
        this.store = new RepositoriesStore();
    }

    public exposePiece(name: string, piece: Repository): void {
        // @ts-ignore Bypass TypeScript check for dynamic property assignment
        this[name] = piece;
    }
}