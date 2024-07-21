import { container } from "@sapphire/framework";
import emojiData from "./emoji-data.json";

export async function loadEmoji(): Promise<void> {
    if (await container.dragonfly.exists("emojis")) {
        return;
    }

    await container.dragonfly.call("JSON.SET", "emojis", "$", JSON.stringify(emojiData));
}

export async function getEmoji(): Promise<unknown> {
    return await container.dragonfly.call("JSON.GET", "emojis", "$");
}
