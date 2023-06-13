import { test } from "vitest";
import { Trinity } from "../../src/trinity";
import { Actions } from "../../src/actions";
import { Token } from "../../src/types";
import { PROXY_TEST_ADDRESS, WETH_AAVE, CETH, WETH, DAI, WSTETH } from "../utils/constants";
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

    const token: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };

    const calldata: any = Actions.depositV2(
        _market,
        _deadline,
        false,
        _poolToken,
        token,
        _onBehalf,
        _onBehalf,
        _amount
    ).data;

    registerFixture("_AAVE_V2_SUPPLY", calldata, amount);
});



test("preparing calldata for AAVE_V3 supply", () => {
    const _underlying = WETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _maxIterations = parseUnits("4"); // Default value
    const _deadline: any = 15;

    const calldata: any = Actions.depositV3(
        _underlying,
        _deadline,
        false,
        { address: _underlying, name: "WETH", symbol: "WETH", decimals: 18 },
        _onBehalf,
        _onBehalf,
        _amount,
        _maxIterations
    ).data;


    registerFixture("_AAVE_V3_SUPPLY", calldata, amount);
});

////////////////////////////////////////////////////////////////
/// --- Repay / Withdraw
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 repay", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("5", 17);
    const _deadline: any = 15;

    const token: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };

    const calldata: any = Actions.repay(
        _market,
        _deadline,
        false,
        _poolToken,
        token,
        _onBehalf,
        _onBehalf,
        _amount,
        false,
    ).data;

    registerFixture("_AAVE_V2_REPAY", calldata, amount);

});

test("preparing calldata for AAVE_V2 withdraw", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    const calldata: any = Actions.withdrawV2(
        _market,
        _deadline,
        false,
        _poolToken,
        [WETH],
        _onBehalf,
        _amount,
        true,
    ).data;

    registerFixture("_AAVE_V2_WITHDRAW", calldata, amount);
});


test("preparing calldata for AAVE_V3 withdraw", () => {
    const _underlying = WETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;


    const calldata: any = Actions.withdrawV3(
        _underlying,
        _deadline,
        false,
        [_underlying],
        _onBehalf,
        _onBehalf,
        _amount,
    ).data;

    registerFixture("_AAVE_V3_WITHDRAW", calldata, amount);

});


////////////////////////////////////////////////////////////////
/// --- Deposit + Borrow
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 supply + borrow", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    const calldata: any = Actions.depositBorrowV2(
        _market,
        _deadline,
        false,
        false,
        _poolToken,
        _poolToken,
        WETH,
        WETH,
        _onBehalf,
        _onBehalf,
        _amount,
        _amount.div(2),
    ).data;

    registerFixture("_AAVE_V2_SUPPLY_BORROW", calldata, amount);
});

test("preparing calldata for AAVE_V3 supply (collateral) + borrow ", () => {
    const _collateral = DAI; // Cannot supply WETH as collateral
    const _borrowed = WETH;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 24); // Supply ridiculously high amount to be sure test passes
    const _deadline: any = 15;

    const calldata: any = Actions.depositCollateralBorrowV3(
        _deadline,
        false,
        false,
        _collateral,
        _borrowed,
        _onBehalf,
        _onBehalf,
        _amount,
        parseUnits("1", 18),
    ).data;

    registerFixture("_AAVE_V3_SUPPLY_BORROW_COLLATERAL", calldata, amount);
});


////////////////////////////////////////////////////////////////
/// --- Payback + Withdraw
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 repay + withdraw", () => {
    const _market = MORPHO_AAVE;
    const _poolToken = WETH_AAVE;
    const _onBehalf = PROXY_TEST_ADDRESS;
    const _amount = parseUnits("1", 18);
    const _deadline: any = 15;

    const callData: any = Actions.paybackWithdrawV2(
        _market,
        _deadline,
        false,
        false,
        _poolToken,
        _poolToken,
        WETH,
        WETH,
        _onBehalf,
        _onBehalf,
        _amount.div(2),
        _amount,
        false,
        false
    ).data;

    registerFixture("_AAVE_V2_PAYBACK_WITHDRAW", callData, amount);
});


test("preparing calldata for AAVE_V3 repay + withdraw", () => {
    const _paybackToken = WETH;
    const _withdrawToken = DAI;
    const _onBehalf = PROXY_TEST_ADDRESS;
    //const _paybackValue = parseUnits("1", 18);
    //const _withdrawValue = parseUnits("1", 24);
    const _deadline: any = 15;

    const callData: any = Actions.paybackWithdrawCollateralV3(
        _deadline,
        false,
        false,
        _paybackToken,
        _withdrawToken,
        _onBehalf,
        _onBehalf,
        parseUnits("0"),
        parseUnits("0"),
        true,
        true
    ).data;

    registerFixture("_AAVE_V3_PAYBACK_WITHDRAW_COLLATERAL", callData, amount);

});

////////////////////////////////////////////////////////////////
/// --- Leverage / Folding
///////////////////////////////////////////////////////////////

test("preparing calldata for AAVE_V2 leverage / deleverage ", async () => {
    const _market = MORPHO_AAVE;
    const _collateralMarketAddress = WETH_AAVE;
    const _debtMarketAddress = WETH_AAVE;
    const _collateralToken: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };
    const _debtToken: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };
    const _onBehalf = PROXY_TEST_ADDRESS;

    const _collateralAmount = parseUnits("2", 18);
    const _debtAmount = parseUnits("1", 18);
    const _deadline: any = 15;

    const _aggregator = ZERO_EX_ROUTER;
    const _slippage = 0.5;


    const calldata: any = (await Actions.leverageV2(
        _market,
        _deadline,
        false,
        _collateralMarketAddress,
        _debtMarketAddress,
        _collateralToken,
        _debtToken,
        _onBehalf,
        _onBehalf,
        _collateralAmount,
        _debtAmount,
        _aggregator,
        _slippage
    )).data;


    registerFixture("_AAVE_V2_LEVERAGE", calldata, amount);


    const deleverageCalldata: any = (await Actions.deleverageV2(
        _market,
        _deadline,
        false,
        _collateralMarketAddress,
        _debtMarketAddress,
        _collateralToken,
        _debtToken,
        _onBehalf,
        _onBehalf,
        _collateralAmount,
        _debtAmount,
        _slippage,
        _aggregator,
        true
    )).data;

    registerFixture("_AAVE_V2_DELEVERAGE", deleverageCalldata, amount);

});

test("preparing calldata for AAVE_V3 leverage", async () => {
    const _collateralToken: Token = { address: WSTETH, name: "WSTETH", symbol: "WSTETH", decimals: 18 };
    const _debtToken: Token = { address: WETH, name: "WETH", symbol: "WETH", decimals: 18 };
    const _onBehalf = PROXY_TEST_ADDRESS;

    const _collateralAmount = parseUnits("1", 18);
    const _debtAmount = parseUnits("2", 18);
    const _deadline: any = 15;

    const _aggregator = ZERO_EX_ROUTER;
    const _slippage = 0.5;

    const calldata: any = (await Actions.leverageV3(
        _deadline,
        false,
        _collateralToken,
        _debtToken,
        _onBehalf,
        _onBehalf,
        _collateralAmount,
        _debtAmount,
        _aggregator,
        _slippage
    )).data;

    registerFixture("_AAVE_V3_LEVERAGE", calldata, amount);
});


////////////////////////////////////////////////////////////////
/// --- Deleverage / Unwind
///////////////////////////////////////////////////////////////

