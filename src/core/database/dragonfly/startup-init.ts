import { container } from "@sapphire/framework";

import { createSearchIndex } from "@/core/database/dragonfly/search-index";
import { FetchResultTypes, fetch } from "@sapphire/fetch";

interface EmojiDataResponse {
    [key: string]: string;
}

async function loadEmojiData(): Promise<void> {
    const check: number = await container.dragonfly.exists("emojis");
    if (check) {
        return container.logger.info("ImperiaClient: Emoji data already exists in the data store, skipping load.");
    }

    const url = "https://cdn.jsdelivr.net/gh/farkmarnum/emojify/src/data/emoji-data.json";
    const data: EmojiDataResponse = await fetch<EmojiDataResponse>(url, FetchResultTypes.JSON);
    if (!data) throw new Error("Failed to fetch emoji data, a feature may not work as expected!");

    await container.dragonfly.call("JSON.SET", "emojis", "$", JSON.stringify(data));
    return container.logger.info("ImperiaClient: Emoji data loaded.");
}

async function createInitialSearchIndexes(): Promise<void> {
    const anilist_idx = await createSearchIndex("anilist_idx", "anilist:search:", {
        type: "TAG",
        search: "TEXT",
        data: "TEXT",
    });

    if (!anilist_idx) container.logger.info("ImperiaClient: Anilist search index already exists, skipping creation.");
    else container.logger.info("ImperiaClient: Anilist search index created.");

    await createSearchIndex("kitsu_idx", "kitsu:search:", {
        type: "TAG",
        search: "TEXT",
        data: "TEXT",
    });

    if (!anilist_idx) container.logger.info("ImperiaClient: Kitsu search index already exists, skipping creation.");
    else container.logger.info("ImperiaClient: Kitsu search index created.");
}

export async function onDfConnectInitialize(): Promise<void> {
    container.logger.info("ImperiaClient: Connected to the Dragonfly data store, caching is now available.");

    container.logger.info("ImperiaClient: Creating full-text search indexes for the data store.");
    await createInitialSearchIndexes();
    container.logger.info("ImperiaClient: Full-text search indexes created.");

    container.logger.info("ImperiaClient: Loading emoji data into the data store.");
    await loadEmojiData();

    container.logger.info("ImperiaClient: Dragonfly data store is ready for use.");
}
