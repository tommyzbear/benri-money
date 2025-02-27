import { privy } from '@/lib/privy';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const claims = await privy.getClaims();

        const { session_id, session_name, role, content } = await req.json();

        await supabase.from('chat_sessions').upsert({
            user_id: claims.userId,
            session_name: session_name,
            session_id: session_id,
            role: role,
            content,
            chat_type: 'individual'
        });

        return new Response('Message saved', { status: 201 });
    } catch (error) {
        console.error('Failed to save chat message:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 