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

export async function initKitsuSearchIndex() {
    const indexName = "kitsu_idx";

    const indexes = (await dragonfly.call("FT._LIST")) as string[];
    if (!indexes.includes(indexName)) {
        await dragonfly.call(
            "FT.CREATE",
            indexName,
            "ON",
            "HASH",
            "PREFIX",
            "1",
            "kitsu_search_",
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

export async function initGitHubRepositorySearchIndex(): Promise<void> {
    const indexName = "github_idx";

    const indexes = (await dragonfly.call("FT._LIST")) as string[];
    if (!indexes.includes(indexName)) {
        await dragonfly.call(
            "FT.CREATE",
            indexName,
            "ON",
            "HASH",
            "PREFIX",
            "1",
            "github_search_",
            "SCHEMA",
            "author",
            "TAG",
            "search",
            "TEXT",
            "data",
            "TEXT",
        );
    }
}

export async function initIndexes(): Promise<void> {
    await initAnilistSearchIndex();
    await initGitHubRepositorySearchIndex();
    await initKitsuSearchIndex();
}
