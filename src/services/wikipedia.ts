import { Service } from "@/core/stores/services/service";
import type { WikipediaFeatured, WikipediaSearchContent, WikipediaSummary } from "@/types/services";
import { FetchResultTypes, QueryError, fetch } from "@sapphire/fetch";

export class WikipediaService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "wikipedia",
        });
    }

    private readonly userAgent = "Imperia (https://github.com/i9ntheory/imperia)";

    private async fetchData<T>(url: string): Promise<T | undefined> {
        try {
            const response: T = await fetch<T>(
                url,
                {
                    headers: {
                        "User-Agent": this.userAgent,
                    },
                },
                FetchResultTypes.JSON,
            );

            return response;
        } catch (error) {
            if (error instanceof QueryError) {
                this.container.logger.warn(`WikipediaService: ${error.message}`);
            }
        }
    }

    public async featured(date: Date = new Date()): Promise<WikipediaFeatured | undefined> {
        const year: number = date.getFullYear();
        const month: string = String(date.getMonth() + 1).padStart(2, "0");
        const day: string = String(date.getDate()).padStart(2, "0");

        const baseUrl: string = "https://en.wikipedia.org/api/rest_v1/feed/featured/";
        const url: string = `${baseUrl}${year}/${month}/${day}`;

        return this.fetchData<WikipediaFeatured>(url);
    }

    public async search(query: string): Promise<WikipediaSearchContent | undefined> {
        const baseUrl: string = "https://api.wikimedia.org/core/v1/wikipedia/en/search/page";

        const params: URLSearchParams = new URLSearchParams({
            q: query,
            limit: "5",
        });

        const url: string = `${baseUrl}?${params.toString()}`;

        return this.fetchData<WikipediaSearchContent>(url);
    }

    public async summary(title: string, random = false): Promise<WikipediaSummary | undefined> {
        if (random) {
            const baseUrl: string = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
            const url: string = `${baseUrl}`;

            return this.fetchData<WikipediaSummary>(url);
        }

        const baseUrl: string = "https://en.wikipedia.org/api/rest_v1/page/summary";
        const url: string = `${baseUrl}/${encodeURIComponent(title)}`;

        return this.fetchData<WikipediaSummary>(url);
    }
}
