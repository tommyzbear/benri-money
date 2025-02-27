import { CategoryListItem, CoinDetail, CoinListItem, CoinMarket, CoinCategory } from "@/types/coingecko_types";

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.GECKO_API_KEY;

export const SONIC_ECO_SYSTEM_ID = "sonic-ecosystem";

export const chainToPlatformId = (chain: string) => {
    switch (chain) {
        case 'Ethereum':
            return 'ethereum';
        case 'Arbitrum':
            return 'arbitrum-one';
        case 'Optimism':
            return 'optimistic-ethereum';
        case 'Base':
            return 'base';
        case 'Sonic':
            return 'sonic';
        default:
            return chain;
    }
}
const buildUrl = (endpoint: string, params: Record<string, string | number | boolean | undefined> = {}) => {
    const url = new URL(`${COINGECKO_API_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            url.searchParams.append(key, String(value));
        }
    });
    return url.toString();
};

export class CoinGeckoAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetchWithAuth(url: string) {
        const response = await fetch(url, {
            headers: {
                'x-cg-demo-api-key': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async getCategories(): Promise<CoinCategory[]> {
        const url = buildUrl('/coins/categories');
        return this.fetchWithAuth(url);
    }

    async getCategoriesList(): Promise<CategoryListItem[]> {
        const url = buildUrl('/coins/categories/list');
        return this.fetchWithAuth(url);
    }

    async getCoinMarkets(params: {
        category?: string;
        vs_currency: string;
    }): Promise<CoinMarket[]> {
        const url = buildUrl('/coins/markets', params);
        return this.fetchWithAuth(url);
    }

    async getCoinsList(params: {
        include_platform?: boolean;
    } = {}): Promise<CoinListItem[]> {
        const url = buildUrl('/coins/list', params);
        return this.fetchWithAuth(url);
    }

    async getCoinById(id: string): Promise<CoinDetail> {
        const url = buildUrl(`/coins/${id}`);
        return this.fetchWithAuth(url);
    }

    async getCoinByContract(platformId: string, contractAddress: string): Promise<CoinDetail> {
        const url = buildUrl(`/coins/${platformId}/contract/${contractAddress}`);
        return this.fetchWithAuth(url);
    }
}

const createCoinGeckoAPI = (apiKey: string) => {
    return new CoinGeckoAPI(apiKey);
};

const coinGeckoAPI = createCoinGeckoAPI(COINGECKO_API_KEY!);

export default coinGeckoAPI;
