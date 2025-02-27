import { SearchMentionsParams, TopMentionsResponse, TopMentionsParams, SmartStatsResponse, SmartStatsParams, TrendingTokensResponse, SearchMentionsResponse, TrendingTokensParams, MentionsParams, MentionsResponse } from "@/types/elfa_types";

const ELFA_API_BASE_URL = 'https://api.elfa.ai/v1';
const ELFA_API_KEY = process.env.ELFA_API_KEY;

// Helper function to build URL with query parameters
const buildUrl = (endpoint: string, params: Record<string, string | number | boolean | undefined>) => {
    const url = new URL(`${ELFA_API_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            url.searchParams.append(key, String(value));
        }
    });
    return url.toString();
};

// API client class
export class ElfaAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetchWithAuth(url: string) {
        console.log('url', url);
        const response = await fetch(url, {
            headers: {
                'x-elfa-api-key': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async searchMentions(params: SearchMentionsParams): Promise<SearchMentionsResponse> {
        const url = buildUrl('/mentions/search', { ...params, limit: 30 });
        return this.fetchWithAuth(url);
    }

    async getTrendingTokens(params: TrendingTokensParams): Promise<TrendingTokensResponse> {
        const url = buildUrl('/trending-tokens', params);
        return this.fetchWithAuth(url);
    }

    async getSmartStats(params: SmartStatsParams): Promise<SmartStatsResponse> {
        const url = buildUrl('/account/smart-stats', params);
        return this.fetchWithAuth(url);
    }

    async getTopMentions(params: TopMentionsParams): Promise<TopMentionsResponse> {
        const url = buildUrl('/top-mentions', params);
        return this.fetchWithAuth(url);
    }

    async getMentions(params: MentionsParams): Promise<MentionsResponse> {
        const url = buildUrl('/mentions', params);
        return this.fetchWithAuth(url);
    }
}

// Export a factory function to create the API client
const createElfaAPI = (apiKey: string) => {
    return new ElfaAPI(apiKey);
};

const elfaAPI = createElfaAPI(ELFA_API_KEY!);

export default elfaAPI;