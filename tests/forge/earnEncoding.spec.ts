import { test } from "vitest";
import { Trinity } from "../../src/trinity";
import { Actions } from "../../src/actions";
import { Token } from "../../src/types";
import { PROXY_TEST_ADDRESS, WETH_AAVE, CETH, WETH, DAI } from "../utils/constants";
import { parseUnits } from "ethers/lib/utils";
import {
    AGGREGATOR_MODULE_ID,
    MORPHO_AAVE,
    MORPHO_COMPOUND,
    MORPHO_AAVE_V3,
    MORPHO_MODULE_ID,
    TOKEN_ACTIONS_MODULE_ID,
    ZERO_EX_ROUTER,
} from "../../src/constants";
import * as TrinityDecoder from "../helpers/trinityDecoder";
import { registerFixture } from "setup-forge";

const amount = "1000000000000000000";

////////////////////////////////////////////////////////////////
/// --- Simple 
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 supply", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    /*
    const calldata: any = Trinity.supply(_market, _poolToken, _onBehalf, _amount);

    const _argPos: any = [0];
    const multicallData: any = Trinity.multicall(_deadline, [calldata], _argPos);
    */

    const token: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };

    const calldata : any = Actions.deposit(
        false,
        _market,
        _deadline,
        false,
        _poolToken,
        token,
        _onBehalf,
        _onBehalf,
        _amount,
        [0]
    );


    registerFixture("_AAVE_V2_SUPPLY", calldata.data, amount);
});


/* CURRENTLY DISABLED ON MORPHO
test("preparing calldata for Compound supply", () => {
    const _market = MORPHO_COMPOUND;
    const _poolToken = CETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    const calldata: any = Trinity.supply(_market, _poolToken, _onBehalf, _amount);

    const _argPos: any = [0];
    const multicallData: any = Trinity.multicall(_deadline, [calldata], _argPos);

    registerFixture("_COMPOUND_SUPPLY", multicallData, amount);
});
*/


test("preparing calldata for AAVE_V3 supply", () => {
    const _underlying = WETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _maxIterations = parseUnits("4"); // Default value
    const _deadline: any = 15;

    const calldata: any = Trinity.supplyAaveV3(_underlying, _amount, _onBehalf, _maxIterations);

    const _argPos: any = [0];
    const multicallData: any = Trinity.multicall(_deadline, [calldata], _argPos);

    registerFixture("_AAVE_V3_SUPPLY", multicallData, amount);
});

////////////////////////////////////////////////////////////////
/// --- Repay / Withdraw
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 repay", () => {


});

test("preparing calldata for AAVE_V2 withdraw", () => {

});


test("preparing calldata for AAVE_V3 withdraw", () => {

});


////////////////////////////////////////////////////////////////
/// --- Deposit / Borrow
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 supply / borrow", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    const calldataA: any = Trinity.supply(_market, _poolToken, _onBehalf, _amount);
    const calldataB: any = Trinity.borrow(_market, _poolToken, _amount.div(2));

    const _argPos: any = [0, 0];
    const multicallData: any = Trinity.multicall(_deadline, [calldataA, calldataB], _argPos);

    registerFixture("_AAVE_V2_SUPPLY_BORROW", multicallData, amount);
});


test("preparing calldata for AAVE_V3 supply (collateral) / borrow ", () => {
    const _collateral = DAI; // Cannot supply WETH as collateral
    const _borrowed = WETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 24); // Supply ridiculously high amount to be sure test passes
    const _maxIterations = parseUnits("4"); // Default value
    const _deadline: any = 15;

    const calldataA: any = Trinity.supplyCollateralAaveV3(_collateral, _amount, _onBehalf);
    const calldataB: any = Trinity.borrowAaveV3(_borrowed, parseUnits("1", 18), _onBehalf, _onBehalf, _maxIterations);

    const _argPos: any = [0, 0];
    const multicallData: any = Trinity.multicall(_deadline, [calldataA, calldataB], _argPos);

    registerFixture("_AAVE_V3_SUPPLY_BORROW", multicallData, amount);
});

