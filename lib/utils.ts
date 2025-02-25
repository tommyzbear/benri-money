import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    optimism,
    base,
    mainnet,
    arbitrum,
    sepolia,
    baseSepolia,
    optimismSepolia,
    arbitrumSepolia,
    polygon,
} from "viem/chains";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getNetworkByChainId(chainId: string) {
    const caip2 = extractCAIP2(chainId);

    if (!caip2) return "Unknown";

    if (caip2.namespace === "eip155") {
        switch (Number(caip2?.chainId)) {
            case base.id:
                return "Base";
            case polygon.id:
                return "Polygon";
            case arbitrum.id:
                return "Arbitrum One";
            case optimism.id:
                return "OP Mainnet";
            case mainnet.id:
                return "Ethereum";
            case sepolia.id:
                return "Sepolia";
            case baseSepolia.id:
                return "Base Sepolia";
            case optimismSepolia.id:
                return "OP Sepolia";
            case arbitrumSepolia.id:
                return "Arbitrum Sepolia";
            default:
                return "Unknown";
        }
    } else if (caip2.namespace === "solana") {
        switch (caip2.chainId) {
            case "mainnet":
                return "Solana";
            case "testnet":
                return "Solana Testnet";
            case "devnet":
                return "Solana Devnet";
            default:
                return "Unknown Solana Network";
        }
    }

    return "Unknown";
}

const extractCAIP2 = (input: string): { namespace: string; chainId: string } | null => {
    const pattern = /^([^:]+):(.+)$/; // Captures everything before and after ":"
    const match = input.match(pattern);

    if (match) {
        return { namespace: match[1], chainId: match[2] };
    }

    return null; // Return null if format doesn't match
};

export function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatValue(value: string | number) {
    const numValue = Number(value);
    if (numValue < 0.01) {
        return "< $0.01";
    }

    return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue);
}

export function getGreetingsByHour() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "time to sleep";
}

export function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
