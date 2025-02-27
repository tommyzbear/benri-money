import { z } from 'zod';
import { TopMentionsParams, SmartStatsParams, TrendingTokensParams, SearchMentionsParams } from '@/types/elfa_types';
import elfaAPI from '@/services/elfa';

export const twitterAnalysis = {
    description: 'Get the latest tweets and mentions of a given keyword, trending tokens, and smart stats of a given twitter account',
    parameters: z.object({
        mentions: z.object({
            keywords: z.string().describe('The keyword to search for, comma separated max 5'),
            from: z.number().describe('The start date to search from, unix timestamp').default(Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7),
            to: z.number().describe('The end date to search to, unix timestamp').default(Math.floor(Date.now() / 1000)),
        }).optional(),
        trendingTokens: z.object({
            timeWindow: z.string().describe('The time window to search for, can be "4h", "24h", "3d", "7d"').default('24h'),
        }).optional(),
        smartStats: z.object({
            username: z.string().describe('The username of the twitter account to get smart stats for')
        }).optional(),
        topMentions: z.object({
            ticker: z.string().describe('The ticker of the token to get top mentions for'),
            timeWindow: z.string().describe('The time window to search for, can be "4h", "24h", "3d", "7d"').default('24h'),
        }).optional(),
    }),
    execute: async ({ mentions, trendingTokens, smartStats, topMentions }: { mentions: SearchMentionsParams, trendingTokens: TrendingTokensParams, smartStats: SmartStatsParams, topMentions: TopMentionsParams }) => {
        console.log('mentions', mentions);
        console.log('trendingTokens', trendingTokens);
        console.log('smartStats', smartStats);
        console.log('topMentions', topMentions);
        try {
            if (mentions) {
                const mentionsResponse = await elfaAPI.searchMentions(mentions);
                return mentionsResponse;
            }

            if (trendingTokens) {
                const trendingTokensResponse = await elfaAPI.getTrendingTokens(trendingTokens);
                return trendingTokensResponse;
            }

            if (smartStats) {
                const smartStatsResponse = await elfaAPI.getSmartStats(smartStats);
                return smartStatsResponse;
            }

            if (topMentions) {
                const topMentionsResponse = await elfaAPI.getTopMentions(topMentions);
                return topMentionsResponse;
            }

            return {
                error: 'No valid parameters provided'
            }
        } catch (error) {
            console.error('Error in twitterAnalysis', error);
            return {
                error: 'Error in twitterAnalysis',
                details: error
            }
        }
    }
}