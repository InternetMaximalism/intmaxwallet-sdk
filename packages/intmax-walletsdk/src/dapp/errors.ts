export class RpcProviderError extends Error {
	constructor(
		message: string,
		public code: number,
	) {
		super(message);
	}
}
