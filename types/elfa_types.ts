export interface SearchMentionsParams {
    keywords: string; // The keyword to search for, comma separated max 5
    from: number; // The start date to search from, unix timestamp
    to: number; // The end date to search to, unix timestamp
    limit: number; // The number of results to return, max 30
}

export interface TrendingTokensParams {
    timeWindow: string;
    page: number;
    pageSize: number;
    minMentions: number;
}

export interface SmartStatsParams {
    username: string;
}

export interface TopMentionsParams {
    ticker: string;
    timeWindow: string;
    page: number;
    pageSize: number;
    includeAccountDetails: boolean;
}

export interface MentionsParams {
    limit: number;
    offset: number;
}

// Add response types for the search mentions endpoint
export interface MentionMetrics {
    like_count: number;
    reply_count: number;
    repost_count: number;
    view_count: number;
}

export interface Mention {
    id: number;
    twitter_id: string;
    twitter_user_id: string;
    content: string;
    mentioned_at: string;
    type: 'post' | 'quote' | 'reply' | 'repost';
    metrics: MentionMetrics;
    sentiment: string;
}

export interface SearchMentionsResponse {
    success: boolean;
    data: Mention[];
    metadata: {
        total: number;
        cursor: string;
    };
}

// Add new type for URL parameters
export type URLParamValue = string | number | boolean;

// Add response types for trending tokens
export interface TrendingToken {
    token: string;
    current_count: number;
    previous_count: number;
    change_percent: number;
}

export interface TrendingTokensResponse {
    success: boolean;
    data: {
        total: number;
        page: number;
        pageSize: number;
        data: TrendingToken[];
    };
}

// Add response type for smart stats
export interface SmartStatsResponse {
    success: boolean;
    data: {
        smartFollowingCount: number;
        averageEngagement: number;
        followerEngagementRatio: number;
    };
}

// Add response type for twitter account info
export interface TwitterAccountInfo {
    username: string;
    twitter_user_id: string;
    description: string;
    profileImageUrl: string;
}

// Add response type for top mentions
export interface TopMention extends Mention {
    twitter_account_info: TwitterAccountInfo;
}

export interface TopMentionsResponse {
    success: boolean;
    data: {
        data: TopMention[];
        total: number;
        page: number;
        pageSize: number;
    };
}

// Add response types for mentions
export interface MediaUrl {
    url: string;
    type: 'photo' | 'video';
}

export interface AccountData {
    name: string;
    location: string;
    userSince: string;
    description: string;
    profileImageUrl: string;
    profileBannerUrl?: string;
}

export interface Account {
    id: number;
    username: string;
    data: AccountData;
    followerCount: number;
    followingCount: number;
    isVerified: boolean;
}

export interface DetailedMention {
    id: string;
    type: 'post' | 'quote' | 'reply' | 'repost';
    content: string;
    originalUrl: string;
    data: {
        mediaUrls: MediaUrl[];
        repliedToUser?: string;
        repliedToTweet?: string;
    };
    likeCount: number;
    quoteCount: number;
    replyCount: number;
    repostCount: number;
    viewCount: number;
    mentionedAt: string;
    bookmarkCount: number;
    account: Account;
}

export interface MentionsResponse {
    success: boolean;
    data: DetailedMention[];
    metadata: {
        total: number;
        limit: number;
        offset: number;
    };
}