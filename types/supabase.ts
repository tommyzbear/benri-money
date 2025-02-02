export type Database = {
    public: {
        Tables: {
            account: {
                Row: {
                    id: string
                    created_at: string
                    has_accepted_terms: boolean | null
                    is_guest: boolean | null
                }
                Insert: {
                    id: string
                    created_at: string
                    has_accepted_terms?: boolean | null
                    is_guest?: boolean | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    has_accepted_terms?: boolean | null
                    is_guest?: boolean | null
                }
            }
            email: {
                Row: {
                    id: number
                    account_id: string | null
                    address: string
                    type: string
                    verified_at: string | null
                    first_verified_at: string | null
                    latest_verified_at: string | null
                }
                Insert: {
                    id?: never // Generated as identity
                    account_id?: string | null
                    address: string
                    type: string
                    verified_at?: string | null
                    first_verified_at?: string | null
                    latest_verified_at?: string | null
                }
                Update: {
                    id?: never // Generated as identity
                    account_id?: string | null
                    address?: string
                    type?: string
                    verified_at?: string | null
                    first_verified_at?: string | null
                    latest_verified_at?: string | null
                }
            }
            wallet: {
                Row: {
                    id: number
                    account_id: string | null
                    address: string
                    type: string
                    verified_at: string | null
                    first_verified_at: string | null
                    latest_verified_at: string | null
                    chain_type: string | null
                    wallet_client_type: string | null
                    connector_type: string | null
                    recovery_method: string | null
                    imported: boolean | null
                    delegated: boolean | null
                    wallet_index: number | null
                }
                Insert: {
                    id?: never // Generated as identity
                    account_id?: string | null
                    address: string
                    type: string
                    verified_at?: string | null
                    first_verified_at?: string | null
                    latest_verified_at?: string | null
                    chain_type?: string | null
                    wallet_client_type?: string | null
                    connector_type?: string | null
                    recovery_method?: string | null
                    imported?: boolean | null
                    delegated?: boolean | null
                    wallet_index?: number | null
                }
                Update: {
                    id?: never // Generated as identity
                    account_id?: string | null
                    address?: string
                    type?: string
                    verified_at?: string | null
                    first_verified_at?: string | null
                    latest_verified_at?: string | null
                    chain_type?: string | null
                    wallet_client_type?: string | null
                    connector_type?: string | null
                    recovery_method?: string | null
                    imported?: boolean | null
                    delegated?: boolean | null
                    wallet_index?: number | null
                }
            }
        }
    }
}