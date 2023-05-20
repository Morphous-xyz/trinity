import { FORK_BLOCK_NUMBER, FORK_URL } from "./global-setup";
import { fetchLogs } from "@viem/anvil";
import { afterAll, afterEach } from "vitest";

import { localhost, mainnet } from "viem/chains";
import {
	createPublicClient,
	createTestClient,
	encodeFunctionData,
	http,
} from "viem";

export const poolId = 1;

export const anvil = {
	...localhost,
	id: 1,
	contracts: mainnet.contracts,
} as const;

export const testClient = createPublicClient({
	chain: anvil,
	transport: http(`http://127.0.0.1:8545/${poolId}`),
});

afterEach((context) => {
	// Print the last log entries from anvil after each test.
	context.onTestFailed(async (result) => {
		try {
			const response = await fetchLogs("http://127.0.0.1:8545", poolId);
			const logs = response.slice(-20);

			if (logs.length === 0) {
				return;
			}

			// Try to append the log messages to the vitest error message if possible. Otherwise, print them to the console.
			const error = result.errors?.[0];

			if (error !== undefined) {
				error.message +=
					"\n\nAnvil log output\n=======================================\n";
				error.message += `\n${logs.join("\n")}`;
			} else {
				// rome-ignore lint/nursery/noConsoleLog: this is fine ...
				console.log(...logs);
			}
		} catch {}
	});
});
