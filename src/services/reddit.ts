import { Service } from "@/lib/stores/services";
import type { PullpushSubmission } from "@/lib/types/pullpush";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { capitalizeFirstLetter, pickRandom, sleep } from "@sapphire/utilities";

interface RedditSubmissionPayload {
    title: string;
    url: string;
}

type Subreddits = "memes" | "programmingmemes";

export class RedditService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "reddit",
        });
    }

    public async postLoadSetup() {
        await sleep(3000);

        await this.setupSubredditCache("memes", "memes", "random memes");
        await this.setupSubredditCache("programmingmemes", "programmingmemes", "random programming memes");
    }

    private async setupSubredditCache(
        subreddit: Subreddits,
        cacheKey: Subreddits,
        cacheDescription: string,
    ): Promise<void> {
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

        const data: RedditSubmissionPayload[] = submissions.data.map((data) => ({
            title: data.title,
            url: data.url,
        }));

        const filteredData: RedditSubmissionPayload[] = data.filter((submission: RedditSubmissionPayload): boolean =>
            submission.url.includes("i.redd.it"),
        );

        await this.container.db.dragonfly.call("JSON.SET", cacheKey, "$", JSON.stringify(filteredData));
        await this.container.db.dragonfly.expire(cacheKey, 7600);
    }

    public async getRandom(key: Subreddits): Promise<RedditSubmissionPayload> {
        const data = (await this.container.db.dragonfly.call("JSON.GET", key)) as string;
        const parsedData: RedditSubmissionPayload[] = JSON.parse(data);

        const randomSubmission: RedditSubmissionPayload = pickRandom(parsedData);
        return randomSubmission;
    }
}
