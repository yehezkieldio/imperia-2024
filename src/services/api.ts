import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import { Service } from "@/core/stores/services/service";
import type { WikipediaPageSummary } from "@/types/wikipedia";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { UserError } from "@sapphire/framework";

export class ApiService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "api",
        });
    }

    public async searchWikipedia(article: string) {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.replace(/\s/g, "_"))}`;

        try {
            const response: WikipediaPageSummary = await fetch<WikipediaPageSummary>(url, FetchResultTypes.JSON);
            return response;
        } catch (error) {
            this.container.logger.error("ApiService: An error occurred while searching Wikipedia.");
            this.container.logger.error(error);

            new UserError({
                identifier: ImperiaIdentifiers.RequestResultError,
                message: "An error occurred while searching Wikipedia.",
                context: { article },
            });
        }
    }
}
