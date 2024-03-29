import { handleAdditionalStorageRequest } from "@/core/additional-storage";
import { popupMessaging } from "@/core/messagings/popup";
import { WebmaxWallet } from "@/core/types";
import { waitIframeWindowReady } from "@/lib/utils";
import { useRequestStore } from "@/popup/stores/request";
import { ethereumProvider, intmaxDappClient } from "intmax-walletsdk/dapp";
import { FC, useEffect, useRef } from "react";
import { useConnectExtension } from "./useConnectExtension";

export const WalletContainer: FC<{
	wallet: WebmaxWallet;
	className?: string;
}> = ({ wallet, className }) => {
	const requests = useRequestStore((state) => state.pendingRequest);
	const ref = useRef<HTMLIFrameElement>(null);
	const approvingRequestsRef = useRef<Set<string>>(new Set());
	const { connect } = useConnectExtension(wallet, ref);

	const request = requests?.[wallet.url];

	// For Beta feature (Used by Intmax Wallet)
	useEffect(() => {
		const listener = async (event: MessageEvent) => {
			if (event.source !== ref.current?.contentWindow) return;
			const result = await handleAdditionalStorageRequest(event);
			if (result) ref.current?.contentWindow?.postMessage(result, event.origin);
		};
		window.addEventListener("message", listener);
		return () => window.removeEventListener("message", listener);
	}, []);

	useEffect(() => {
		if (!(ref.current?.contentWindow && request)) return;

		const [iframe, contentWindow] = [ref.current, ref.current.contentWindow];
		if (approvingRequestsRef.current.has(request.id)) return;
		approvingRequestsRef.current.add(request.id);

		(async () => {
			await connect().then(() => new Promise((resolve) => setTimeout(resolve, 500)));
			await waitIframeWindowReady(iframe);

			const client = intmaxDappClient({
				wallet: {
					name: wallet.name,
					url: wallet.url,
					window: { mode: "custom", onClose: () => {}, window: contentWindow },
				},
				metadata: { ...request.metadata, overrideUrl: request.metadata.host },
				providers: { eip155: ethereumProvider() },
			});

			const provider = await client.provider("eip155");
			await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: request.chainId }] });

			const result = await provider.request({ method: request.method, params: request.params });
			await popupMessaging.sendMessage("onResult", { id: request.id, result });
		})().catch((error) => {
			console.error("WalletContainer error", error);
			popupMessaging.sendMessage("onResult", { id: request.id, error });
		});
	}, [request, wallet, connect]);

	return (
		<iframe
			ref={ref}
			title={wallet.name}
			src={wallet.url}
			className={className}
			allow="clipboard-write; encrypted-media; web-share; publickey-credentials-get"
		/>
	);
};
