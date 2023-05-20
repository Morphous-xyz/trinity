import { test } from "vitest";
import { parseAbi } from "viem";
import { testClient } from "./setup/setup";
import { readContract } from "viem/contract";

export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const account = "0x6b175474e89094c44da98b954eedeac495271d0f";

const result = await readContract(testClient, {
	abi: parseAbi([
		"function balanceOf(address account) view returns (uint256)",
	] as const),
	functionName: "balanceOf",
	address: USDT,
	args: [USDC],
});

test("should work as expected", () => {
	console.log(result);
});
