import { Repository } from "@/core/stores/repositories/repository";
import { Store } from "@sapphire/pieces";

export class RepositoriesStore extends Store<Repository, "repositories"> {
    public constructor() {
        super(Repository, { name: "repositories" });
    }
}
