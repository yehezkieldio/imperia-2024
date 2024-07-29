import { Service } from "@/lib/stores/services";
import type { PullpushSubmission } from "@/lib/types/pullpush";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { pickRandom, sleep } from "@sapphire/utilities";

interface RedditSubmission {
    title: string;
    url: string;
}

/**
 * A reminder that case sentitivity is important on subreddit names.
 * Since subreddit names are case sensitive, and can be mistaken for a different subreddit.
 */
export type AvailableSubreddit = "memes" | "DankMemes" | "ProgrammerHumor";

export class RedditService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "reddit",
        });
    }

    public isValidSubreddit(subreddit: string): subreddit is AvailableSubreddit {
        return ["memes", "DankMemes", "ProgrammerHumor"].includes(subreddit);
    }

    public async _postLoad(): Promise<void> {
        // We wait for 2 seconds to ensure other components are loaded, before we start setting up the cache.
        await sleep(2000);

        const subreddits: AvailableSubreddit[] = ["memes", "DankMemes", "ProgrammerHumor"];

        this.container.logger.info("RedditService: Setting up caches for subreddits");
        for (const subreddit of subreddits) {
            await this.setupCache(subreddit);
        }
        this.container.logger.info("RedditService: Subreddit caches setup complete");
    }

    public async rebuildCache(subreddit: AvailableSubreddit): Promise<void> {
        const cacheKey: string = subreddit.toLowerCase();

        if (await this.container.db.dragonfly.exists(cacheKey)) {
            await this.container.db.dragonfly.del(cacheKey);
        }

        await this.setupCache(subreddit);
    }

    private async setupCache(subreddit: AvailableSubreddit): Promise<void> {
        const cacheKey: string = subreddit.toLowerCase();
        const cacheExists: number = await this.container.db.dragonfly.exists(cacheKey);

        if (cacheExists) {
            return this.container.logger.info(`RedditService: r/${subreddit} cache already exists, skipping setup`);
        }

        this.container.logger.info(`RedditService: Setting up r/${subreddit} cache`);
        await this.fetchSubmissions(subreddit, cacheKey);
        this.container.logger.info(`RedditService: r/${subreddit} cache setup complete`);
    }

    public async fetchSubmissions(subreddit: AvailableSubreddit, cacheKey: string) {
        const sortTypes: string[] = ["score", "num_comments", "created_utc"];
        const type: string = pickRandom(sortTypes);

        const url: string = `https://api.pullpush.io/reddit/submission/search?html_decode=True&subreddit=${subreddit}&size=100&sort_type=${type}`;
        const submissions: PullpushSubmission = await fetch(url, FetchResultTypes.JSON);

        const data: RedditSubmission[] = submissions.data
            .filter((data): string => data.url)
            .map(
                (data): RedditSubmission => ({
                    title: data.title,
                    url: data.url,
                }),
            );

        const filteredData: RedditSubmission[] = data.filter((submission: RedditSubmission): boolean =>
            submission.url.includes("i.redd.it"),
        );

        await this.container.db.dragonfly.call("JSON.SET", cacheKey, "$", JSON.stringify(filteredData));
        await this.container.db.dragonfly.expire(cacheKey, 7600);
    }

    public async getRandom(subreddit: AvailableSubreddit): Promise<RedditSubmission> {
        const cacheKey: string = subreddit.toLowerCase();

        if (!(await this.container.db.dragonfly.exists(cacheKey))) {
            await this.setupCache(subreddit);
        }

        const data: string = (await this.container.db.dragonfly.call("JSON.GET", cacheKey)) as string;
        const parsedData: RedditSubmission[] = JSON.parse(data);

        return pickRandom(parsedData);
    }
}
