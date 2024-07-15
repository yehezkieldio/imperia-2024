export interface AnilistCoverImage {
    large: string;
}

export interface AnilistTitle {
    romaji: string;
    native: string;
    english: string;
}

export interface AnilistExternalLinks {
    url: string;
}

export interface AnilistQueryResult {
    id: number;
    description: string;
    coverImage: AnilistCoverImage;
    title: AnilistTitle;
    externalLinks: AnilistExternalLinks[];
    bannerImage?: string;
    format?: string;
    averageScore?: number;
    episodes?: number;
    status?: string;
    duration?: number;
}
