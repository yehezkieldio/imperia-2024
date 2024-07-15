interface KitsuLinks {
    self: string;
}

interface KitsuTitles {
    en_jp: string;
    ja_jp: string;
}

interface KitsuImage {
    tiny: string;
    small: string;
    medium?: string;
    large: string;
    original: string;
}

interface KitsuAttributes {
    description: string;
    titles: KitsuTitles;
    canonicalTitle: string;
    abbreviatedTitles: string[];
    posterImage: KitsuImage;
    coverImage: Omit<KitsuImage, "medium">;
}

export interface KitsuQueryResult {
    links: KitsuLinks;
    attributes: KitsuAttributes;
}
