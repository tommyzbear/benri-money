import { http, createConfig } from '@wagmi/core'
import { base, polygon, mainnet } from '@wagmi/core/chains'

export const config = createConfig({
    chains: [base, polygon, mainnet],
    transports: {
        [base.id]: http(),
        [polygon.id]: http(),
        [mainnet.id]: http(),
    },
})