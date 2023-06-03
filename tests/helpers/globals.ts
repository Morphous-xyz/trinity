import { localhost, mainnet, foundry } from "viem/chains";
import {
	createPublicClient,
	createTestClient,
	createWalletClient,
	encodeFunctionData,
	http,
	custom,
} from "viem";
import { POOL_ID } from "utils/constants";
import type { Abi } from "abitype";
import type {
	SimulateContractParameters,
	WriteContractParameters,
} from "viem/contract";
import { parseAccount } from "viem/utils";

export const anvil = {
	...localhost,
	id: POOL_ID,
	contracts: mainnet.contracts,
} as const;

export const publicClient = createPublicClient({
	chain: anvil,
	transport: http(`http://127.0.0.1:8545/${POOL_ID}`),
});

export const testClient = createTestClient({
	chain: foundry,
	mode: "anvil",
	transport: http(`http://127.0.0.1:8545/${POOL_ID}`),
});

export const walletClient = createWalletClient({
	chain: anvil,
	transport: http(`http://127.0.0.1:8545/${POOL_ID}`),
});

// Copied from Enzyme Finance
export async function sendTestTransaction<
	TAbi extends Abi | readonly unknown[],
	TFunctionName extends string = string,
>(args: SimulateContractParameters<TAbi, TFunctionName, typeof anvil>) {
	const { request, result } = await publicClient.simulateContract(args);
	const account = parseAccount(request.account);
	const params = request as unknown as WriteContractParameters;

	// We simply pretend that the simulation is always correct. This is not going to work outside of a pristine, isolated, test environment.
	const hash = await testClient.sendUnsignedTransaction({
		from: account.address,
		to: params.address,
		data: encodeFunctionData(params),
		...(params.value === undefined ? {} : { value: params.value }),
		...(params.nonce === undefined ? {} : { nonce: params.nonce }),
		...(params.gas === undefined ? {} : { gas: params.gas }),
		...(params.gasPrice === undefined ? {} : { gas: params.gasPrice }),
		...(params.accessList === undefined
			? {}
			: { accessList: params.accessList }),
		...(params.maxFeePerGas === undefined
			? {}
			: { maxFeePerGas: params.maxFeePerGas }),
		...(params.maxPriorityFeePerGas === undefined
			? {}
			: { maxPriorityFeePerGas: params.maxPriorityFeePerGas }),
	});

	const receipt = await publicClient.waitForTransactionReceipt({ hash });

	return { request, result, receipt, hash };
}
