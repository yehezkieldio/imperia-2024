import { Service } from "@/lib/stores/services";
import type { PullpushSubmission } from "@/lib/types/pullpush";
import { FetchResultTypes, QueryError, fetch } from "@sapphire/fetch";
import { pickRandom, sleep } from "@sapphire/utilities";

interface RedditSubmission {
    title: string;
    url: string;
}

/**
 * Case sentitivity is important on subreddit names.
 * Since subreddit names are case sensitive, and can be mistaken for a different subreddit.
 */
const subreddits = ["memes", "dankmemes", "ProgrammerHumor", "HistoryMemes", "Animemes"] as const;
export type AvailableSubreddit = (typeof subreddits)[number];

export class RedditService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "reddit",
        });
    }

    redditIconUrl = "https://www.redditinc.com/assets/images/site/Reddit_Icon_FullColor-1_2023-11-29-161416_munx.jpg";

    public isValidSubreddit(subreddit: AvailableSubreddit): subreddit is AvailableSubreddit {
        return subreddits.includes(subreddit);
    }

    public async _postLoad(): Promise<void> {
        // We wait for 3 seconds to ensure other components are loaded, before we start setting up the cache.
        await sleep(3000);

        this.container.logger.info("RedditService: Setting up caches for subreddits, this may take a while...");
        for (const subreddit of subreddits) {
            await this.setupCache(subreddit);
        }
        this.container.logger.info("RedditService: Subreddit caches setup complete and ready for use.");
    }

    public async rebuildCache(subreddit: AvailableSubreddit): Promise<void> {
        const cacheKey: string = `cache:${subreddit.toLowerCase()}`;

        if (await this.container.db.dragonfly.exists(cacheKey)) {
            await this.container.db.dragonfly.del(cacheKey);
        }

        await this.setupCache(subreddit);
    }

    private async setupCache(subreddit: AvailableSubreddit): Promise<void> {
        const cacheKey: string = `cache:${subreddit.toLowerCase()}`;
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
        const submissions: PullpushSubmission = await this.fetchRetry(url, 3);

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

        await this.container.db.dragonfly.call("JSON.SET", `${cacheKey}`, "$", JSON.stringify(filteredData));
        await this.container.db.dragonfly.expire(cacheKey, 7600);
    }

    private async fetchRetry(url: string, retries: number): Promise<PullpushSubmission> {
        try {
            return await fetch<PullpushSubmission>(url, FetchResultTypes.JSON);
        } catch (error) {
            if (error instanceof QueryError) {
                if (retries === 0) throw error;
                await sleep(3000);
                this.container.logger.error("RedditService: Fetch failed, retrying...");
                return this.fetchRetry(url, retries - 1);
            }

            throw error;
        }
    }

    public async getRandom(subreddit: AvailableSubreddit): Promise<RedditSubmission> {
        const cacheKey: string = `cache:${subreddit.toLowerCase()}`;

        if (!(await this.container.db.dragonfly.exists(cacheKey))) {
            await this.setupCache(subreddit);
        }

        const data: string = (await this.container.db.dragonfly.call("JSON.GET", cacheKey)) as string;
        const parsedData: RedditSubmission[] = JSON.parse(data);

        return pickRandom(parsedData);
    }
}
