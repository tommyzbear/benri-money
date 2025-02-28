export interface ChatMessage {
    id: string;
    content?: string;
    sender: "user" | "other";
    timestamp: Date;
    type: "message" | "payment" | "request";
    amount?: number;
    tx?: string;
    decimals?: number;
    tokenName?: string;
    chain?: string;
    requestedTokenName?: string;
    requestedTokenDecimals?: number;
    requestedTokenAmount?: number;
}
