import { container } from "@sapphire/framework";
import emojiData from "./emoji-data.json";

export async function loadEmoji(): Promise<void> {
    await container.df.call("JSON.SET", "emojis", "$", JSON.stringify(emojiData));
}

export async function getEmoji(): Promise<unknown> {
    return await container.df.call("JSON.GET", "emojis", "$");
}
