import { EXTENSION_URL } from "@/constants";
import { WebmaxWallet } from "@/core/types";
import { waitIframeWindowReady } from "@/lib/utils";
import { useWalletMetadataStore } from "@/popup/stores/wallet";
import { intmaxDappClient } from "intmax-walletsdk/dapp";
import { RefObject, useCallback } from "react";

export const useConnectExtension = (wallet: WebmaxWallet, ref: RefObject<HTMLIFrameElement>) => {
	const setMetadata = useWalletMetadataStore((state) => state.setMetadata);

	const connect = useCallback(async () => {
		if (!ref.current?.contentWindow) return;

		await waitIframeWindowReady(ref.current);

		const client = intmaxDappClient({
			wallet: {
				name: wallet.name,
				url: wallet.url,
				window: { mode: "custom", onClose: () => {}, window: ref.current.contentWindow },
			},
			metadata: { name: "Webmax Extension", description: "Webmax Extension", icons: [], overrideUrl: EXTENSION_URL },
		});

		const result = await client.connect();

		const metadata = { ...result, url: wallet.url };
		setMetadata(wallet, metadata);
	}, [wallet, setMetadata, ref]);

	return { connect };
};
