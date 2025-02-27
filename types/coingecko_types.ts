export interface CategoryListItem {
    category_id: string;
    name: string;
}

export interface CoinCategory {
    id: string;
    name: string;
    market_cap: number | null;
    market_cap_change_24h: number | null;
    content: string;
    top_3_coins_id: string[];
    top_3_coins: string[];
    volume_24h: number | null;
    updated_at: string | null;
}

export interface CoinMarket {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: null | {
        times: number;
        currency: string;
        percentage: number;
    };
    last_updated: string;
}

export interface CoinListItem {
    id: string;
    symbol: string;
    name: string;
    platforms: Record<string, string>;
}

// Add new interfaces for the coin details response
export interface CoinLinks {
    homepage: string[];
    whitepaper: string;
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: number | null;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
        github: string[];
        bitbucket: string[];
    };
    snapshot_url: string;
}

export interface CoinImage {
    thumb: string;
    small: string;
    large: string;
}

export interface PriceData {
    [key: string]: number;  // For currency prices like usd, eur, etc.
}

export interface MarketData {
    current_price: PriceData;
    total_value_locked: number | null;
    market_cap: PriceData;
    total_volume: PriceData;
    high_24h: PriceData;
    low_24h: PriceData;
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    total_supply: number;
    max_supply: number | null;
    circulating_supply: number;
    last_updated: string;
    mcap_to_tvl_ratio: number | null;
    fdv_to_tvl_ratio: number | null;
    roi: null | {
        times: number;
        currency: string;
        percentage: number;
    };
    market_cap_fdv_ratio: number;
    market_cap_rank: number;
    fully_diluted_valuation: PriceData;
    max_supply_infinite: boolean;
}

export interface CoinDetail {
    id: string;
    symbol: string;
    name: string;
    web_slug: string;
    asset_platform_id: string;
    platforms: Record<string, string>;
    block_time_in_minutes: number;
    hashing_algorithm: string | null;
    categories: string[];
    description: Record<string, string>;
    links: CoinLinks;
    image: CoinImage;
    country_origin: string;
    genesis_date: string | null;
    contract_address: string;
    sentiment_votes_up_percentage: number | null;
    sentiment_votes_down_percentage: number | null;
    market_cap_rank: number;
    market_data: MarketData;
    last_updated: string;
    detail_platforms: Record<string, DetailPlatform>;
    preview_listing: boolean;
    public_notice: string;
    additional_notices: string[];
    localization: Record<string, string>;
    watchlist_portfolio_users: number;
    community_data: CommunityData;
    developer_data: DeveloperData;
    status_updates: any[]; // Can be typed more specifically if needed
    tickers: CoinTicker[];
}

// Add new interfaces for platform details
export interface DetailPlatform {
    decimal_place: number;
    contract_address: string;
}

// Add community data interface
export interface CommunityData {
    facebook_likes: number | null;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number | null;
}

// Add developer data interface
export interface DeveloperData {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    code_additions_deletions_4_weeks: {
        additions: number | null;
        deletions: number | null;
    };
    commit_count_4_weeks: number;
    last_4_weeks_commit_activity_series: number[];
}

// Add interface for tickers
export interface CoinTicker {
    base: string;
    target: string;
    market: {
        name: string;
        identifier: string;
        has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: {
        btc: number;
        eth: number;
        usd: number;
    };
    converted_volume: {
        btc: number;
        eth: number;
        usd: number;
    };
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: string;
    last_traded_at: string;
    last_fetch_at: string;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
}