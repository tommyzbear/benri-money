// Account Interface
export interface Account {
    id: string;
    created_at: string;
    has_accepted_terms: boolean | null;
    is_guest: boolean | null;
    profile_img: string | null;
    username: string;
}

// Email Interface
export interface Email {
    id: number;
    account_id: string | null;
    address: string;
    type: string;
    verified_at: string | null;
    first_verified_at: string | null;
    latest_verified_at: string | null;
}

// Wallet Interface
export interface Wallet {
    id: number;
    account_id: string | null;
    address: string;
    type: string;
    verified_at: string | null;
    first_verified_at: string | null;
    latest_verified_at: string | null;
    chain_type: string | null;
    wallet_client_type: string | null;
    connector_type: string | null;
    recovery_method: string | null;
    imported: boolean | null;
    delegated: boolean | null;
    wallet_index: number | null;
}

export interface Friend {
    account_id: string;
    friend_id: string;
    created_at: string;
}

export interface TransactionHistory {
    id: number;
    from_account_id: string;
    from_address: string;
    from_username?: string;
    from_profile_img?: string;
    to_account_id: string;
    to_address: string;
    to_username?: string;
    to_profile_img?: string;
    amount: bigint;
    token_address: string;
    tx: string;
    transaction_type: string;
    chain_id: number;
    chain: string;
    token_name: string;
    created_at: string;
}

export interface PaymentRequest {
    id: number;
    requester: string;
    payee: string;
    chain_id: number;
    chain: string;
    transaction_type: string;
    amount: bigint;
    token_name: string;
    token_address: string;
    requested_at: string;
    cleared: boolean;
    rejected: boolean;
}

export interface PaymentRequestWithWallet extends PaymentRequest {
    requester_wallet: string;
}

export interface Google {
    id: number;
    account_id: string;
    subject: string;
    email: string;
    name: string;
    type: string;
    verified_at: string;
    first_verified_at: string;
    latest_verified_at: string;
}

export interface Twitter {
    id: number;
    account_id: string;
    subject: string;
    username: string;
    name: string;
    profile_picture_url: string;
    type: string;
    verified_at: string;
    first_verified_at: string;
    latest_verified_at: string;
}

export interface Discord {
    id: number;
    account_id: string;
    subject: string;
    username: string;
    email: string;
    type: string;
    verified_at: string;
    first_verified_at: string;
    latest_verified_at: string;
}

export interface SimplePaymentQrCode {
    id: number;
    amount: bigint;
    token_name: string;
    chain: string;
}
