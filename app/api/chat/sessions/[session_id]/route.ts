import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { privy } from '@/lib/privy';

export async function GET(
    request: Request,
    { params }: { params: { session_id: string } }
) {
    try {
        const claims = await privy.getClaims();

        const { session_id } = await params;

        const { data, error } = await supabase
            .from('chat_sessions')
            .select('content')
            .eq('session_id', session_id)
            .eq('user_id', claims.userId)
            .order('timestamp', { ascending: true })

        if (error) throw error;

        const messages = data.map((item) => item.content)

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching session messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch session messages' },
            { status: 500 }
        )
    }
}