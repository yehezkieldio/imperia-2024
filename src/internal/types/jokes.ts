export interface RandomJokesQueryResult {
    error: boolean;
    category: "Programming" | "Misc" | "Dark" | "Pun" | "Spooky" | "Christmas";
    type: "twopart" | "single";
    joke: string;
    setup: string;
    delivery: string;
    flags: Flags;
    id: number;
    safe: boolean;
    lang: string;
}

export interface RandomYomamaJokesQueryResult {
    joke: string;
    category: string;
}

interface Flags {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
}
