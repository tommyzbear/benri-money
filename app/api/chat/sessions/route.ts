import { privy } from '@/lib/privy';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('session_id, session_name, timestamp')
            .eq('user_id', claims.userId)
            .eq('chat_type', 'individual')
            .order('timestamp', { ascending: false })

        if (error) throw error;

        // Get unique sessions (in case there are duplicates)
        const uniqueSessions = Array.from(
            new Map(data.map(item => [item.session_id, item])).values()
        );

        return Response.json(uniqueSessions);
    } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 