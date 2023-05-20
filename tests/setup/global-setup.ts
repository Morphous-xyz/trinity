import { startProxy } from "@viem/anvil";

export const FORK_URL =
	"https://mainnet.infura.io/v3/b5dc2199e2254c10b4bd4a39b78a7e89";
export const FORK_BLOCK_NUMBER = BigInt(17302414);

export default async function () {
	return await startProxy({
		options: {
			forkBlockNumber: FORK_BLOCK_NUMBER,
			forkUrl: FORK_URL,
		},
	});
}
