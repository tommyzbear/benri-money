import Image from "next/image";
import { cn } from "@/lib/utils";

interface NetworkIconProps {
    chain: string;
    className?: string;
}

export function NetworkIcon({ chain, className }: NetworkIconProps) {
    let iconSrc = "/"
    let altText = "token"
    switch (chain) {
        case "Base":
            iconSrc = "/icons/base-logo.svg";
            altText = "Base";
            break;
        case "Ethereum":
            iconSrc = "/icons/ethereum-eth-logo.svg";
            altText = "Ethereum";
            break;
        case "Polygon":
            iconSrc = "/icons/polygon-matic-logo.svg";
            altText = "Polygon";
            break;
        // case "Solana":
        //     iconSrc = "/icons/solana-sol-logo.svg";
        //     altText = "Solana";
        //     break;
    }

    return (
        <div className={cn("relative", className)}>
            <Image
                src={iconSrc}
                alt={altText}
                fill
                className="rounded-full object-contain"
            />
        </div>
    );
}