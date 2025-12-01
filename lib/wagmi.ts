import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
    chains: [base],
    connectors: [
        injected(), // Farcaster Mini App (webview) injected provider'ı otomatik algılar
    ],
    transports: {
        [base.id]: http(),
    },
});
