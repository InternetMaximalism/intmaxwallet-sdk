import { popupMessaging } from "@/core/messagings/popup";
import { WebmaxWallet } from "@/core/types";
import { waitIframeWindowReady } from "@/lib/utils";
import { useRequestStore } from "@/popup/stores/request";
import { FC, useEffect, useRef } from "react";
import { ethereumProvider, webmaxDappClient } from "walletnext/dapp";
import { useConnectExtension } from "./useConnectExtension";

window.addEventListener("message", (event) => {
	console.log("Received message", event);
});

export const WalletContainer: FC<{
	wallet: WebmaxWallet;
	className?: string;
}> = ({ wallet, className }) => {
	const requests = useRequestStore((state) => state.pendingRequest);
	const ref = useRef<HTMLIFrameElement>(null);
	const approvingRequestsRef = useRef<Set<string>>(new Set());
	const { connect } = useConnectExtension(wallet, ref);

	const request = requests?.[wallet.url];

	console.info("WalletContainer", request);

	useEffect(() => {
		if (!(ref.current?.contentWindow && request)) return;

		const [iframe, contentWindow] = [ref.current, ref.current.contentWindow];
		if (approvingRequestsRef.current.has(request.id)) return;
		approvingRequestsRef.current.add(request.id);

		(async () => {
			console.info("WalletContainer1", request);
			await connect().then(() => new Promise((resolve) => setTimeout(resolve, 500)));
			console.info("WalletContainer2", request);

			await waitIframeWindowReady(iframe);

			console.info("WalletContainer3", request);

			const client = webmaxDappClient({
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

			console.info("WalletContainer4", request);
			const result = await provider.request({ method: request.method, params: request.params });

			console.info("WalletContainer5", result);

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
