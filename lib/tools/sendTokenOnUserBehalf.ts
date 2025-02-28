import { z } from 'zod';
import { privy } from '../privy';
import { config } from '../wallet/config';
import { supabase } from '../supabase';

export const sendTokenOnUserBehalf = {
    description: 'Send a specify amount of token on behalf of a user to a recipient, user can provide a username or email address',
    parameters: z.object({
        chain: z.string().describe("Chain to swap on, it can be a chain id or a chain name, must be explicitly specified").refine((val) => val === 'Base' || val === 'Ethereum' || val === 'Polygon', {
            message: 'Chain not supported, please select a supported chain from Base, Ethereum, or Polygon'
        }).default('Base'),
        token: z.string().describe('The token to send').refine((val) => val === 'ETH' || val === 'USDC' || val === "WETH" || val === "WBTC", {
            message: 'Token not supported, please select a supported token from ETH, USDC, WETH, or WBTC'
        }).default('USDC'),
        recipient: z.string().describe('The username of the recipient or email address'),
        amount: z.number().describe('The amount of token to send')
    }),
    execute: async (
        { chain, token, recipient, amount }: { chain: string, token: string, recipient: string, amount: number }) => {
        try {
            const chainId = config.chains.find((c) => c.name === chain)?.id;
            if (!chainId) {
                return {
                    message: 'Chain not supported, please select a supported chain from Base, Ethereum, or Polygon',
                    supportedChains: config.chains.map((chain) => chain.name)
                }
            }

            const claims = await privy.getClaims();

            const { data, error } = await supabase
                .from("friends")
                .select(
                    `
                friend:friend_id(
                    id,
                    username,
                    profile_img,
                    email:email(address),
                    wallet:wallet(address, wallet_client_type)
                )
            `
                )
                .eq("account_id", claims.userId)
                .returns<
                    {
                        friend: {
                            id: string;
                            username: string;
                            profile_img: string | null;
                            email: Array<{ address: string }>;
                            wallet: Array<{ address: string, wallet_client_type: string }>;
                        };
                    }[]
                >();

            if (error) {
                console.error('Supabase error:', error);
                return {
                    error: error,
                    message: 'Failed to get friends'
                }
            }

            const friend = data.find((friend) => friend.friend.username === recipient || friend.friend.email[0].address === recipient);

            if (!friend) {
                return {
                    error: 'Friend not found',
                    message: 'Please add them as a friend in contacts'
                }
            }

            const { data: tokenData, error: tokenError } = await supabase
                .from('supported_tokens')
                .select('*')
                .eq('symbol', token)
                .eq('chain_id', chainId)
                .single();

            if (tokenError) {
                console.error('Supabase error:', tokenError);
                return {
                    error: tokenError,
                    message: 'Failed to get token'
                }
            }

            return {
                message: 'Friend found',
                transaction_info: {
                    to_account_id: friend.friend.id,
                    to_address: friend.friend.wallet.find((wallet) => wallet?.wallet_client_type === 'privy')?.address,
                    amount: amount.toString(),
                    token_address: tokenData.address,
                    token_name: tokenData.symbol,
                    chain_id: chainId,
                    chain: chain,
                    decimals: tokenData.decimals,
                }
            }
        } catch (error) {
            console.error('Send money on behalf of user error:', error);
            return {
                error: error,
                message: 'Failed to send money on behalf of user'
            }
        }
    }
};
