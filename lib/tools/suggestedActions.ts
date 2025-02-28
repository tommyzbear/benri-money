const suggestedActions = [
    {
        name: "Send Token",
        description: "Send ETH, USDC, WETH, or WBTC to another user",
        icon: "send-token",
        sampleMessage: "Send 10 USDC to username",
    },
    {
        name: "Token Price",
        description: "Get real-time price and trading info for any token",
        icon: "price",
        sampleMessage: "What's the current price of TIA?",
    },
    {
        name: "Twitter Trends",
        description: "Analyze crypto trends and sentiment on Twitter",
        icon: "trending",
        sampleMessage: "What are the trending tokens in the last 24h?",
    },
    {
        name: "Market Research",
        description: "Get detailed information about crypto projects",
        icon: "research",
        sampleMessage: "Tell me about the Celestia blockchain",
    },
    {
        name: "Social Stats",
        description: "Get smart stats for any Twitter account",
        icon: "social",
        sampleMessage: "Show me the smart stats for @VitalikButerin",
    },
    {
        name: "Token Mentions",
        description: "Track token mentions and sentiment",
        icon: "mentions",
        sampleMessage: "Show me top mentions for TIA in the last 24h",
    }
];

export interface SuggestedAction {
    name: string;
    description: string;
    icon: string;
    sampleMessage: string;
}

export default suggestedActions;