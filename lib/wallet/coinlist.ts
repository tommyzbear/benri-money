export const approvedTokens = {
    "Base Sepolia": {
        name: "ChainLink Token",
        symbol: "LINK",
        address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
        decimals: 18
    },
    "Sepolia": {
        name: "ChainLink Token",
        symbol: "LINK",
        address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        decimals: 18
    }
}



export interface TokenMetadata {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}