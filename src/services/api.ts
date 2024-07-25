import { Service } from "@/core/stores/services/service";
import type {} from "@/types/services";
import type { RandomCatFact } from "@/types/services/api/cat-fact";
import type { RandomChuckNorrisFact } from "@/types/services/api/chucknorris-fact";
import type { DadJoke } from "@/types/services/api/dadjoke";
import type { RandomDogFact } from "@/types/services/api/dog-fact";
import type { RandomCat } from "@/types/services/api/random-cat";
import type { RandomDog } from "@/types/services/api/random-dog";
import type { RandomDuck } from "@/types/services/api/random-duck";
import type { RandomFact } from "@/types/services/api/random-fact";
import type { RandomFox } from "@/types/services/api/random-fox";
import type { RandomInspirationalQuote } from "@/types/services/api/random-insp-quote";
import type { RandomJoke } from "@/types/services/api/random-joke";
import type { RandomWaifu } from "@/types/services/api/random-waifu";
import type { YoMama } from "@/types/services/api/yo-mama";
import { FetchResultTypes, QueryError, fetch } from "@sapphire/fetch";

export class ApiService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "api",
        });
    }

    private readonly userAgent = "Imperia (https://github.com/i9ntheory/imperia)";

    private async fetchData<T>(url: string, headers = {}): Promise<T | undefined> {
        try {
            const response: T = await fetch<T>(
                url,
                {
                    headers: {
                        "User-Agent": this.userAgent,
                        ...headers,
                    },
                },
                FetchResultTypes.JSON,
            );

            return response;
        } catch (error) {
            if (error instanceof QueryError) {
                this.container.logger.warn(`ApiService: ${error.message}`);
            }
        }
    }

    public async randomCat(): Promise<RandomCat | undefined> {
        const url: string = "https://cataas.com/cat?json=true";

        return this.fetchData<RandomCat>(url);
    }

    public async randomCatFact(): Promise<RandomCatFact | undefined> {
        const url: string = "https://catfact.ninja/fact";

        return this.fetchData<RandomCatFact>(url);
    }

    public async randomChuckNorrisFact(): Promise<RandomChuckNorrisFact | undefined> {
        const url: string = "https://api.chucknorris.io/jokes/random";

        return this.fetchData<RandomChuckNorrisFact>(url);
    }

    public async randomDadJoke(): Promise<DadJoke | undefined> {
        const url: string = "https://icanhazdadjoke.com";

        return this.fetchData<DadJoke>(url);
    }

    public async randomDog(): Promise<RandomDog | undefined> {
        const url: string = "https://dog.ceo/api/breeds/image/random";

        return this.fetchData<RandomDog>(url);
    }

    public async randomDogFact(): Promise<RandomDogFact | undefined> {
        const url: string = "https://dog-api.kinduff.com/api/facts?number=1";

        return this.fetchData<RandomDogFact>(url);
    }

    public async randomDuck(): Promise<RandomDuck | undefined> {
        const url: string = "https://random-d.uk/api/random";

        return this.fetchData<RandomDuck>(url);
    }

    public async randomFact(): Promise<RandomFact | undefined> {
        const url: string = "https://nekos.life/api/v2/fact";

        return this.fetchData<RandomFact>(url);
    }

    public async randomFox(): Promise<RandomFox | undefined> {
        const url: string = "https://randomfox.ca/floof";

        return this.fetchData<RandomFox>(url);
    }

    public async randomInspirationalQuote(): Promise<RandomInspirationalQuote | undefined> {
        const baseUrl: string = "http://api.forismatic.com/api/1.0";
        const params: URLSearchParams = new URLSearchParams({
            method: "getQuote",
            format: "json",
            lang: "en",
        });
        const url: string = `${baseUrl}?${params.toString()}`;

        return this.fetchData<RandomInspirationalQuote>(url);
    }

    public async randomJoke(): Promise<RandomJoke | undefined> {
        const url: string = "https://sv443.net/jokeapi/v2/joke/Any";

        return this.fetchData<RandomJoke>(url);
    }

    public async randomWaifu(): Promise<RandomWaifu | undefined> {
        const url: string = "https://api.waifu.pics/sfw/waifu";

        return this.fetchData<RandomWaifu>(url);
    }

    public async randomYoMama(): Promise<YoMama | undefined> {
        const url: string = "https://www.yomama-jokes.com/api/v1/jokes/random";

        return this.fetchData<YoMama>(url);
    }
}
