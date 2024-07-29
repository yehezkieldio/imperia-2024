import { Repository } from "@/lib/stores/repositories/repository";
import { Store } from "@sapphire/framework";

export class RepositoriesStore extends Store<Repository, "repos"> {
    public constructor() {
        super(Repository, { name: "repos" });
    }
}
