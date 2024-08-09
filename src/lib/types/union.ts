import type { ImperiaCommand } from "@/lib/extensions/commands/command";
import type { InteractionResponse, Message } from "discord.js";

export type MessageChatResponse = Message | InteractionResponse;
export type MessageChatContext = Message | ImperiaCommand.ChatInputCommandInteraction;
