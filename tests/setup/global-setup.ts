import { startProxy } from "@viem/anvil";
import { FORK_BLOCK_NUMBER, FORK_URL } from "../utils/constants";

export default async function () {
	return await startProxy({
		options: {
			forkBlockNumber: FORK_BLOCK_NUMBER,
			forkUrl: FORK_URL,
		},
	});
}
