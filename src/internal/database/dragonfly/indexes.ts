import { dragonfly } from "@/internal/database/dragonfly/connection";

export async function initAnilistSearchIndex() {
    const indexName = "anilist_idx";

    const indexes = (await dragonfly.call("FT._LIST")) as string[];
    if (!indexes.includes(indexName)) {
        await dragonfly.call(
            "FT.CREATE",
            indexName,
            "ON",
            "HASH",
            "PREFIX",
            "1",
            "anilist_search_",
            "SCHEMA",
            "type",
            "TAG",
            "search",
            "TEXT",
            "data",
            "TEXT",
        );
    }
}
