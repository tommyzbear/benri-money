// Account Interface
export interface Account {
    id: string;
    created_at: string;
    has_accepted_terms: boolean | null;
    is_guest: boolean | null;
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

// Input types for creating new records
export interface CreateAccount extends Omit<Account, 'id' | 'created_at'> {
    id?: string;
    created_at?: string;
}

export interface CreateEmail extends Omit<Email, 'id'> {
    id?: never; // Generated as identity
}

export interface CreateWallet extends Omit<Wallet, 'id'> {
    id?: never; // Generated as identity
}

// Update types
export type UpdateAccount = Partial<Account>;
export type UpdateEmail = Partial<Omit<Email, 'id'>>;
export type UpdateWallet = Partial<Omit<Wallet, 'id'>>; 