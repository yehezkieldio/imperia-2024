import type { EmojiDataResponse } from "@/lib/types/emojidata";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { container } from "@sapphire/framework";

async function loadEmojiData(): Promise<void> {
    const check: number = await container.db.dragonfly.exists("app:emojis");
    if (check) {
        return container.logger.info("ImperiaClient: Emoji data already exists in the data store, skipping load.");
    }

    const url = "https://cdn.jsdelivr.net/gh/farkmarnum/emojify/src/data/emoji-data.json";
    const data: EmojiDataResponse = await fetch<EmojiDataResponse>(url, FetchResultTypes.JSON);
    if (!data) throw new Error("Failed to fetch emoji data, a feature may not work as expected!");

    await container.db.dragonfly.call("JSON.SET", "app:emojis", "$", JSON.stringify(data));
    return container.logger.info("ImperiaClient: Emoji data loaded.");
}

export async function onDragonFlyReadySetup() {
    container.logger.info("ImperiaClient: Connected to the Dragonfly data store.");

    container.logger.info("ImperiaClient: Loading emoji data into the data store...");
    await loadEmojiData();

    container.logger.info("ImperiaClient: Dragonfly data store is ready for use.");
}
