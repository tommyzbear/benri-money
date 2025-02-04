-- Table 1: Account
CREATE TABLE Account (
    id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    has_accepted_terms BOOLEAN DEFAULT FALSE,
    is_guest BOOLEAN DEFAULT FALSE
);
-- Table 2: Email
CREATE TABLE Email (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(255) REFERENCES Account(id),
    address VARCHAR(255) NOT NULL UNIQUE,
    -- Ensures email address is unique
    type VARCHAR(50) NOT NULL,
    verified_at TIMESTAMP,
    first_verified_at TIMESTAMP,
    latest_verified_at TIMESTAMP
);
-- Table 3: Wallet
CREATE TABLE Wallet (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(255) REFERENCES Account(id),
    address VARCHAR(255) NOT NULL UNIQUE,
    -- Ensures wallet address is unique
    type VARCHAR(50) NOT NULL,
    verified_at TIMESTAMP,
    first_verified_at TIMESTAMP,
    latest_verified_at TIMESTAMP,
    chain_type VARCHAR(50),
    wallet_client_type VARCHAR(50),
    connector_type VARCHAR(50),
    recovery_method VARCHAR(50),
    imported BOOLEAN DEFAULT FALSE,
    delegated BOOLEAN DEFAULT FALSE,
    wallet_index INT
);
-- Table: Friends
CREATE TABLE Friends (
    account_id VARCHAR(255) NOT NULL,
    friend_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Optional: Tracks when the friendship was added
    PRIMARY KEY (account_id, friend_id),
    -- Prevents duplicate friendships
    FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES Account(id) ON DELETE CASCADE
);
CREATE TABLE transaction_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- Auto-incrementing ID
    from_account_id VARCHAR(255) NOT NULL REFERENCES Account(id) ON DELETE CASCADE,
    -- Reference to Account 'from' ID
    to_account_id VARCHAR(255) NOT NULL REFERENCES Account(id) ON DELETE CASCADE,
    -- Reference to Account 'to' ID
    from_address VARCHAR(255) NOT NULL,
    -- Sender's wallet address
    to_address VARCHAR(255) NOT NULL,
    -- Receiver's wallet address
    amount BIGINT NOT NULL,
    -- Transaction amount
    token_address VARCHAR(255) NOT NULL,
    -- Token contract address
    tx VARCHAR(255) NOT NULL,
    -- Transaction hash
    transaction_type VARCHAR(50) NOT NULL,
    -- Transaction type
    chain_id BIGINT NOT NULL,
    -- Chain ID
    chain VARCHAR(50) NOT NULL,
    token_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);