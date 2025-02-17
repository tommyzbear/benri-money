import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { optimism, base, mainnet, arbitrum } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNetworkByChainId(chainId: string) {
  const caip2 = extractCAIP2(chainId);

  if (!caip2) return "Unknown";

  if (caip2.namespace === "eip155") {
    switch (Number(caip2?.chainId)) {
      case base.id:
        return "Base";
      case arbitrum.id:
        return "Arbitrum One";
      case optimism.id:
        return "OP Mainnet";
      case mainnet.id:
        return "Ethereum";
      default:
        return "Unknown";
    }
  }

  else if (caip2.namespace === "solana") {
    return "Solana";
  }

  return "Unknown";
}

const extractCAIP2 = (input: string): { namespace: string, chainId: string } | null => {
  const pattern = /^([^:]+):(.+)$/; // Captures everything before and after ":"
  const match = input.match(pattern);

  if (match) {
    return { namespace: match[1], chainId: match[2] };
  }

  return null; // Return null if format doesn't match
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}