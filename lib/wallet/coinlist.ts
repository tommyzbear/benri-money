export const nativeTokenList = {
    "Base Sepolia": {
        name: "Ether",
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18
    },
    "Sepolia": {
        name: "Ether",
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18
    }
}



export interface TokenMetadata {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}