import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { container } from "@sapphire/framework";

interface EmojiDataResponse {
    [key: string]: string;
}

const url = "https://cdn.jsdelivr.net/gh/farkmarnum/emojify/src/data/emoji-data.json";

export async function loadEmoji(): Promise<boolean> {
    const check: number = await container.dragonfly.exists("emojis");
    if (check) return false;

    const data: EmojiDataResponse = await fetch<EmojiDataResponse>(url, FetchResultTypes.JSON);
    if (!data) throw new Error("Failed to fetch emoji data.");

    await container.dragonfly.call("JSON.SET", "emojis", "$", JSON.stringify(data));
    return true;
}
