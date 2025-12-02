import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame } from './connector';

export const config = createConfig({
    chains: [base],
    connectors: [
        farcasterFrame(),
    ],
    transports: {
        [base.id]: http(),
    },
});
