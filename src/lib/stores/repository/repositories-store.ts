import { Repository } from "@/lib/stores/repository/repository";
import { Store } from "@sapphire/framework";

export class RepositoriesStore extends Store<Repository, "repos"> {
    public constructor() {
        super(Repository, { name: "repos" });
    }
}
