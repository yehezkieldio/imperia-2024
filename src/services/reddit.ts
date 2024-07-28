import { Service } from "@/lib/stores/services";
import type { PullpushSubmission } from "@/lib/types/pullpush";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { capitalizeFirstLetter, pickRandom, sleep } from "@sapphire/utilities";

export class RedditService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "reddit",
        });
    }

    #randomMemeKey = "random-memes";
    #randomProgrammingMemeKey = "random-programming-memes";

    public async postLoadSetup() {
        await sleep(3000);

        await this.setupSubredditCache("memes", this.#randomMemeKey, "random memes");
        await this.setupSubredditCache("programmingmemes", this.#randomProgrammingMemeKey, "random programming memes");
    }

    private async setupSubredditCache(subreddit: string, cacheKey: string, cacheDescription: string): Promise<void> {
        const cacheExists: number = await this.container.db.dragonfly.exists(cacheKey);

        if (cacheExists) {
            return this.container.logger.info(
                `RedditService: ${capitalizeFirstLetter(cacheDescription)} cache already exists, skipping setup`,
            );
        }

        this.container.logger.info(`RedditService: Setting up ${cacheDescription} cache`);

        await this.fetchSubmissions(subreddit, cacheKey);

        this.container.logger.info(`RedditService: ${capitalizeFirstLetter(cacheDescription)} cache setup complete`);
    }

    private async fetchSubmissions(subreddit: string, cacheKey: string): Promise<void> {
        const sortTypes: string[] = ["score", "num_comments", "created_utc"];
        const type: string = pickRandom(sortTypes);
        const url: string = `https://api.pullpush.io/reddit/submission/search?html_decode=True&subreddit=${subreddit}&size=100&sort_type=${type}`;

        const submissions: PullpushSubmission = await fetch<PullpushSubmission>(url, FetchResultTypes.JSON);

        let urls: string[] = submissions.data.map((data) => data.url);
        urls = urls.filter((url: string): boolean => url !== "");

        /**
         *  ? should we verify or filter for dead Reddit URLs?
         *  ? with the current changes, it may lead to false positives with hitting their urls.
         */

        await this.container.db.dragonfly.rpush(cacheKey, ...urls);
        await this.container.db.dragonfly.expire(cacheKey, 7600);
    }
}
