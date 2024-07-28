export interface PullpushSubmission {
    data: Datum[];
    metadata: Metadata;
    error: null;
}

interface Metadata {
    op_a: number;
    op_b: number;
    total: number;
}

interface Datum {
    approved_at_utc: null;
    subreddit: string;
    selftext: string;
    author_fullname?: string;
    saved: boolean;
    mod_reason_title: null;
    gilded: number;
    clicked: boolean;
    title: string;
    link_flair_richtext: (Linkflairrichtext | Linkflairrichtext2)[];
    subreddit_name_prefixed: string;
    hidden: boolean;
    pwls: null;
    link_flair_css_class: null | string;
    downs: number;
    thumbnail_height: null | number;
    top_awarded_type: null;
    hide_score: boolean;
    name: string;
    quarantine: boolean;
    link_flair_text_color: string;
    upvote_ratio: number;
    author_flair_background_color: null | string;
    subreddit_type: string;
    ups: number;
    total_awards_received: number;
    media_embed: Mediaembed;
    thumbnail_width: null | number;
    author_flair_template_id: null | string;
    is_original_content: boolean;
    user_reports: string[];
    secure_media: null;
    is_reddit_media_domain: boolean;
    is_meta: boolean;
    category: null;
    secure_media_embed: Mediaembed;
    link_flair_text: null | string;
    can_mod_post: boolean;
    score: number;
    approved_by: null;
    is_created_from_ads_ui: boolean;
    author_premium?: boolean;
    thumbnail: string;
    edited: boolean;
    author_flair_css_class: null | string;
    author_flair_richtext?: (Linkflairrichtext | Authorflairrichtext2 | Linkflairrichtext2)[];
    gildings: Mediaembed;
    post_hint?: string;
    content_categories: null;
    is_self: boolean;
    mod_note: null;
    created: number;
    link_flair_type: string;
    wls: null;
    removed_by_category: null | string;
    banned_by: null;
    author_flair_type?: string;
    domain: string;
    allow_live_comments: boolean;
    selftext_html: null | string;
    likes: null;
    suggested_sort: string;
    banned_at_utc: null;
    url_overridden_by_dest: string;
    view_count: null;
    archived: boolean;
    no_follow: boolean;
    is_crosspostable: boolean;
    pinned: boolean;
    over_18: boolean;
    preview?: Preview;
    all_awardings: string[];
    awarders: string[];
    media_only: boolean;
    can_gild: boolean;
    spoiler: boolean;
    locked: boolean;
    author_flair_text: null | string;
    treatment_tags: string[];
    visited: boolean;
    removed_by: null;
    num_reports: null;
    distinguished: null;
    subreddit_id: string;
    author_is_blocked: boolean;
    mod_reason_by: null;
    removal_reason: null;
    link_flair_background_color: string;
    id: string;
    is_robot_indexable: boolean;
    report_reasons: null;
    author: string;
    discussion_type: null;
    num_comments: number;
    send_replies: boolean;
    whitelist_status: null;
    contest_mode: boolean;
    mod_reports: string[];
    author_patreon_flair?: boolean;
    author_flair_text_color: null | string;
    permalink: string;
    parent_whitelist_status: null;
    stickied: boolean;
    url: string;
    subreddit_subscribers: number;
    created_utc: number;
    num_crossposts: number;
    media: null;
    is_video: boolean;
    link_flair_template_id?: string;
}

interface Preview {
    images: Image[];
    enabled: boolean;
}

interface Image {
    source: Source;
    resolutions: Source[];
    variants: Variants;
    id: string;
}

interface Variants {
    gif?: Gif;
    mp4?: Gif;
    obfuscated?: Gif;
}

interface Gif {
    source: Source;
    resolutions: Source[];
}

interface Source {
    url: string;
    width: number;
    height: number;
}

interface Authorflairrichtext2 {
    a: string;
    e: string;
    u: string;
}

type Mediaembed = Record<string, unknown>;

interface Linkflairrichtext2 {
    e: string;
    t: string;
}

interface Linkflairrichtext {
    a?: string;
    e: string;
    u?: string;
    t?: string;
}
