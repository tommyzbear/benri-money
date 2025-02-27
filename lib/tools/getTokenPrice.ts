import { z } from 'zod';
import { getPairsMatchingQuery } from '@/services/dexscreener';
import { supabase } from '@/lib/supabase';
import coinGeckoAPI from '@/services/coingecko';

export const getTokenPrice = {
    description: 'Get the current price and trading information for a token',
    parameters: z.object({
        token: z.string().describe('The token symbol or name or address to search for')
    }),
    execute: async ({ token }: { token: string }) => {
        try {

            // Attempt to fetch token from coingecko
            if (token.length < 42) {
                const { data, error } = await supabase
                    .from('coingecko_tokens')
                    .select('id')
                    .eq('symbol', token);

                if (!error && data) {
                    const results = [];
                    for (const coin of data) {
                        const coinData = await coinGeckoAPI.getCoinById(coin.id);

                        results.push({
                            symbol: coinData.symbol,
                            price: coinData.market_data.current_price.usd,
                            priceChange24hPercentage: coinData.market_data.price_change_percentage_24h,
                            volume24h: coinData.market_data.total_volume.usd,
                            buys24h: coinData.market_data.total_volume.usd,
                            sells24h: coinData.market_data.total_volume.usd,
                            source: 'coingecko',
                        });
                    }

                    return results.sort((a, b) => b.volume24h - a.volume24h)[0];
                }
            }

            // Attempt to fetch token from dexscreener
            const pairs = await getPairsMatchingQuery(token)

            if (pairs.length === 0) {
                return `No pairs found for token ${token}`;
            }

            // Sort pairs by liquidity (highest first)
            const sortedPairs = pairs.sort((a, b) => {
                const liquidityA = Number(a.liquidity?.usd || 0);
                const liquidityB = Number(b.liquidity?.usd || 0);
                return liquidityB - liquidityA;
            });

            const pair = sortedPairs[0];
            return {
                token: pair.baseToken.symbol,
                price: pair.priceUsd,
                priceChange24hPercentage: pair.priceChange?.h24,
                volume24h: pair.volume?.h24,
                buys24h: pair.txns?.h24?.buys,
                sells24h: pair.txns?.h24?.sells,
                dex: pair.dexId,
                chain: pair.chainId
            };
        } catch (error) {
            console.error('DexScreener API error:', error);
            return `Failed to fetch token price for ${token}`;
        }
    }
}; 