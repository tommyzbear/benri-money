import { supabase } from "@/lib/supabase";
import { EmailWithMetadata, User, WalletWithMetadata } from "@privy-io/react-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const user = (await request.json()) as User;

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('account')
            .select()
            .eq('id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: 'Error checking user existence' }, { status: 500 });
        }

        if (!existingUser) {
            // Insert new user
            const { data: insertedUser, error: insertError } = await supabase
                .from('account')
                .insert({
                    id: user.id,
                    created_at: user.createdAt,
                    has_accepted_terms: user.hasAcceptedTerms,
                    is_guest: user.isGuest,
                })
                .select()
                .single();

            if (insertError || !insertedUser) {
                console.error('Error inserting user:', insertError);
                return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
            }

            if (user.email && user.linkedAccounts.filter(account => account.type === 'email').length > 0) {
                const email = user.linkedAccounts.find(account => account.type === 'email') as EmailWithMetadata;
                const { error: insertEmailError } = await supabase
                    .from('email')
                    .insert({
                        account_id: insertedUser.id,
                        address: email.address,
                        type: 'email',
                        verified_at: email.verifiedAt,
                        first_verified_at: email.firstVerifiedAt,
                        latest_verified_at: email.latestVerifiedAt,
                    });

                if (insertEmailError) {
                    console.error('Error inserting email:', insertEmailError);
                    return NextResponse.json({ error: 'Error creating email' }, { status: 500 });
                }
            }

            if (user.wallet && user.linkedAccounts.filter(account => account.type === 'wallet').length > 0) {
                const wallet = user.linkedAccounts.find(account => account.type === 'wallet') as WalletWithMetadata;
                const { error: insertWalletError } = await supabase
                    .from('wallet')
                    .insert({
                        account_id: insertedUser.id,
                        address: wallet.address,
                        type: 'wallet',
                        verified_at: wallet.verifiedAt,
                        first_verified_at: wallet.firstVerifiedAt,
                        latest_verified_at: wallet.latestVerifiedAt,
                        chain_type: wallet.chainType,
                        wallet_client_type: wallet.walletClientType,
                        connector_type: wallet.connectorType,
                        recovery_method: wallet.recoveryMethod,
                        imported: wallet.imported,
                        delegated: wallet.delegated,
                        wallet_index: wallet.walletIndex,
                    });

                if (insertWalletError) {
                    console.error('Error inserting wallet:', insertWalletError);
                    return NextResponse.json({ error: 'Error creating wallet' }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 