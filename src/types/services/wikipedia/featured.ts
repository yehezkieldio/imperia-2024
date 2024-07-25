export interface WikipediaFeatured {
    tfa: Tfa;
    mostread: Mostread;
    image: Image;
    onthisday: Onthisday[];
}

interface Onthisday {
    text: string;
    pages: Page[];
    year: number;
}

interface Page {
    type: string;
    title: string;
    displaytitle: string;
    namespace: Namespace;
    wikibase_item: string;
    titles: Titles;
    pageid: number;
    thumbnail?: Thumbnail;
    originalimage?: Thumbnail;
    lang: string;
    dir: string;
    revision: string;
    tid: string;
    timestamp: string;
    description?: string;
    description_source?: string;
    content_urls: Contenturls;
    extract: string;
    extract_html: string;
    normalizedtitle: string;
    coordinates?: Coordinates;
}

interface Image {
    title: string;
    thumbnail: Thumbnail;
    image: Thumbnail;
    file_page: string;
    artist: Artist;
    credit: Artist;
    license: License;
    description: Description;
    wb_entity_id: string;
    structured: Structured;
}

interface Structured {
    captions: Captions;
}

interface Captions {
    uk: string;
    en: string;
    vi: string;
}

interface Description {
    html: string;
    text: string;
    lang: string;
}

interface License {
    type: string;
    code: string;
    url: string;
}

interface Artist {
    html: string;
    text: string;
}

interface Mostread {
    date: string;
    articles: Article[];
}

interface Article {
    views: number;
    rank: number;
    view_history: Viewhistory[];
    type: string;
    title: string;
    displaytitle: string;
    namespace: Namespace;
    wikibase_item: string;
    titles: Titles;
    pageid: number;
    thumbnail?: Thumbnail;
    originalimage?: Thumbnail;
    lang: string;
    dir: string;
    revision: string;
    tid: string;
    timestamp: string;
    description?: string;
    description_source?: string;
    content_urls: Contenturls;
    extract: string;
    extract_html: string;
    normalizedtitle: string;
    coordinates?: Coordinates;
}

interface Coordinates {
    lat: number;
    lon: number;
}

interface Viewhistory {
    date: string;
    views: number;
}

interface Tfa {
    type: string;
    title: string;
    displaytitle: string;
    namespace: Namespace;
    wikibase_item: string;
    titles: Titles;
    pageid: number;
    thumbnail: Thumbnail;
    originalimage: Thumbnail;
    lang: string;
    dir: string;
    revision: string;
    tid: string;
    timestamp: string;
    description: string;
    description_source: string;
    content_urls: Contenturls;
    extract: string;
    extract_html: string;
    normalizedtitle: string;
}

interface Contenturls {
    desktop: Desktop;
    mobile: Desktop;
}

interface Desktop {
    page: string;
    revisions: string;
    edit: string;
    talk: string;
}

interface Thumbnail {
    source: string;
    width: number;
    height: number;
}

interface Titles {
    canonical: string;
    normalized: string;
    display: string;
}

interface Namespace {
    id: number;
    text: string;
}
