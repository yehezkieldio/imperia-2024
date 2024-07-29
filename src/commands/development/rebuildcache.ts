import type { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaSubcommand } from "@/lib/extensions/subcommand";
import type { AvailableSubreddit } from "@/services/reddit";
import { type Args, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import type { Message } from "discord.js";

export class RebuildCacheCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Rebuild the cache for a specified service or other.",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            preconditions: ["DeveloperOnly"],
            subcommands: [
                {
                    name: "reddit",
                    messageRun: "messageReddit",
                    default: true,
                },
            ],
        });
    }

    public async messageReddit(message: Message, args: Args): Promise<Message> {
        const subreddit = await args.pick("string").catch(() => "memes");

        if (!this.container.services.reddit.isValidSubreddit(subreddit as AvailableSubreddit)) {
            return await message.reply({
                content: "（￢з￢） The subreddit you provided is invalid!",
            });
        }

        await this.container.services.reddit.rebuildCache(subreddit as AvailableSubreddit);

        return await message.reply({
            content: "(๑>ᗜºั) Successfully rebuilt the cache for the specified subreddit!",
        });
    }
}
