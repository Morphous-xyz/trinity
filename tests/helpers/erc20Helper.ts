import { Address } from "viem";
import { testClient } from "../setup/setup";

/// @notice Setting an ERC20 contract to a new bytecode, for allowing arbitrary actions.
export async function mockERC20(
    tokenAddress: Address
) {
    await testClient.setCode({
        address: tokenAddress,
        bytecode: '0x60806040526000600355600019600955600c80546001600160a01b031916737a250d5630b4cf539739df...'
    })

}

export function setBalance(
    tokenAddress: Address,
    address: Address,
    value: BigInt
) {

}