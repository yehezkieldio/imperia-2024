export interface WikipediaSearchContent {
    pages: SearchContentPage[];
}

interface SearchContentPage {
    id: number;
    key: string;
    title: string;
    excerpt: string;
    matched_title: null;
    description: string;
    thumbnail: SearchContentThumbnail | null;
}

interface SearchContentThumbnail {
    mimetype: string;
    width: number;
    height: number;
    duration: null;
    url: string;
}
