import { sdk } from "@farcaster/frame-sdk";
import { SwitchChainError, fromHex, getAddress, numberToHex } from "viem";
import { ChainNotConfiguredError, createConnector } from "wagmi";

export function farcasterFrame() {
    return createConnector((config) => ({
        id: "farcaster",
        name: "Farcaster Frame",
        type: "farcaster",

        async connect({ chainId } = {}) {
            const provider = await sdk.wallet.getEthereumProvider();
            if (!provider) throw new Error("Farcaster provider not found");

            const accounts = await provider.request({
                method: "eth_requestAccounts",
            });

            let currentChainId = await this.getChainId();
            if (chainId && currentChainId !== chainId) {
                const chain = await this.switchChain!({ chainId });
                currentChainId = chain.id;
            }

            return {
                accounts: accounts.map((x: string) => getAddress(x)),
                chainId: currentChainId,
            } as any;
        },

        async disconnect() {
            // Nothing to do
        },

        async getAccounts() {
            const provider = await sdk.wallet.getEthereumProvider();
            if (!provider) return [];

            const accounts = await provider.request({
                method: "eth_accounts",
            });
            return accounts.map((x: string) => getAddress(x));
        },

        async getChainId() {
            const provider = await sdk.wallet.getEthereumProvider();
            if (!provider) return 0; // Or throw

            const chainId = await provider.request({ method: "eth_chainId" });
            return fromHex(chainId, "number");
        },

        async isAuthorized() {
            const accounts = await this.getAccounts();
            return !!accounts.length;
        },

        async switchChain({ chainId }) {
            const provider = await sdk.wallet.getEthereumProvider();
            if (!provider) throw new Error("Provider not found");

            const chain = config.chains.find((x) => x.id === chainId);
            if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: numberToHex(chainId) }],
            });
            return chain;
        },

        onAccountsChanged(accounts) {
            config.emitter.emit("change", {
                accounts: accounts.map((x: string) => getAddress(x)),
            });
        },

        onChainChanged(chain) {
            const chainId = fromHex(chain as `0x${string}`, "number");
            config.emitter.emit("change", { chainId });
        },

        async onDisconnect() {
            config.emitter.emit("disconnect");
        },

        async getProvider() {
            return await sdk.wallet.getEthereumProvider();
        },
    }));
}
