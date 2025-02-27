import { z } from 'zod';
import tvly from '@/services/tavily';

export const research = {
    description: 'If none of the other tools are relevant, you can use this tool to search the web for information',
    parameters: z.object({
        searchQuery: z.string().describe('The search query to search for'),
    }),
    execute: async ({ searchQuery }: { searchQuery: string }) => {
        const results = await tvly.search(searchQuery, {
            include_links: true,
        });
        return results;
    }
}