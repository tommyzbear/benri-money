import { http, createConfig } from '@wagmi/core'
import { base, arbitrum, optimism, mainnet, baseSepolia } from '@wagmi/core/chains'

export const config = createConfig({
    chains: [base, arbitrum, optimism, mainnet, baseSepolia],
    transports: {
        [base.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
        [mainnet.id]: http(),
        [baseSepolia.id]: http(),
    },
})