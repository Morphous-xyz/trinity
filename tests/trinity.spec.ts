import { expect, test } from "vitest";
import { Trinity } from "../src/trinity";
import { PROXY_TEST_ADDRESS } from "./utils/constants";
import { parseUnits } from "ethers/lib/utils";
import {
    MORPHO_COMPOUND,
    MORPHO_AAVE,
    MORPHO_AAVE_V3,
    ZERO_EX_ROUTER,
    INCH_ROUTER,
    MORPHO_MODULE_ID,
    TOKEN_ACTIONS_MODULE_ID
} from "../src/constants";
import { decodeSupplyWithoutMaxGas } from "./helpers/trinityDecoder";

////////////////////////////////////////////////////////////////
/// --- Basic Actions
///////////////////////////////////////////////////////////////


test("supply should be encoded and decoded correctly", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e"; // WETH market
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);

    const calldata: any = Trinity.supply(
        _market,
        _poolToken,
        _onBehalf,
        _amount
    );

    const decoded = decodeSupplyWithoutMaxGas(calldata);

    expect(decoded[0]).toBe(_market);
    expect(decoded[1]).toBe(_poolToken);
    expect(decoded[2]).toBe(_onBehalf);
    expect(Number(decoded[3])).toBe(Number(_amount));


});
