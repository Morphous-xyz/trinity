// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.20;

import "tests/forge/Test.sol";

import {BaseTest} from "tests/forge/BaseTest.sol";
import {IDSProxy} from "morphous/interfaces/IDSProxy.sol";
import {Constants} from "morphous/libraries/Constants.sol";
import {IMorphoLens} from "lib/morphous/test/interfaces/IMorphoLens.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

interface IMakerRegistry {
    function build() external returns (address proxy);
}

contract EarnTest is BaseTest {
    using stdJson for string;

    address _poolToken = 0x030bA81f1c18d280636F32af80b9AAd02Cf0854e; // WETH Market

    function setUp() public override {
        super.setUp();
    }

    function test_executeFlashloan() public {
        MethodParameters memory params = readFixture(json, "._EXECUTE_FLASHLOAN");
        /// Setup Proxy
        /// proxy.execute(address(_NEO), params.data);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Simple
    ///////////////////////////////////////////////////////////////

    function test_supply_aaveV2() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V2_SUPPLY");

        deal(Constants._WETH, address(proxy), 1e18);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_MORPHOUS, params.data);

        (,, uint256 _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 1e18);
    }

    /* CURRENTLY DISABLED ON MORPHO
    function test_supply_compound() public {
        MethodParameters memory params = readFixture(json, "._COMPOUND_SUPPLY");

        deal(Constants._WETH, address(proxy), 1e18);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_MORPHOUS, params.data);

        (,, uint256 _totalBalance) = IMorphoLens(_MORPHO_COMPOUND_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);

        assertApproxEqAbs(_totalBalance, 1e18, 1);
    }
    */

    function test_supply_aaveV3() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V3_SUPPLY");

        deal(Constants._WETH, address(proxy), 1e18);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_MORPHOUS, params.data);

        uint256 _totalBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).supplyBalance(Constants._WETH, _proxy);

        assertApproxEqAbs(_totalBalance, 1e18, 4);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Repay / Withdraw
    ///////////////////////////////////////////////////////////////

    function test_repay_aaveV2() public {
        MethodParameters memory supplyBorrowParams = readFixture(json, "._AAVE_V2_SUPPLY_BORROW");
        MethodParameters memory repayParams = readFixture(json, "._AAVE_V2_REPAY");

        deal(Constants._WETH, address(proxy), 1e18);

        // Supply and borrow
        vm.prank(_proxyOwner);
        proxy.execute{value: supplyBorrowParams.value}(_MORPHOUS, supplyBorrowParams.data);

        (,, uint256 _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        (,, uint256 _totalBorrowed) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentBorrowBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 1e18);
        assertEq(_totalBorrowed, 1e18 / 2);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18 / 2, 4);

        // Repay
        vm.prank(_proxyOwner);
        proxy.execute{value: repayParams.value}(_MORPHOUS, repayParams.data);

        (,, _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        (,, _totalBorrowed) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentBorrowBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 1e18);
        assertEq(_totalBorrowed, 0);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 0, 4);
    }

    function test_withdraw_aaveV2() public {
        MethodParameters memory supplyParams = readFixture(json, "._AAVE_V2_SUPPLY");
        MethodParameters memory withdrawParams = readFixture(json, "._AAVE_V2_WITHDRAW");

        deal(Constants._WETH, address(proxy), 1e18);

        // Supply
        vm.prank(_proxyOwner);
        proxy.execute{value: supplyParams.value}(_MORPHOUS, supplyParams.data);

        (,, uint256 _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);

        assertApproxEqAbs(_totalSupplied, 1e18, 1);

        // Withdraw
        vm.prank(_proxyOwner);
        proxy.execute{value: withdrawParams.value}(_MORPHOUS, withdrawParams.data);

        (,, _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 0);
    }

    function test_withdraw_aaveV3() public {
        MethodParameters memory supplyParams = readFixture(json, "._AAVE_V3_SUPPLY");
        MethodParameters memory withdrawParams = readFixture(json, "._AAVE_V3_WITHDRAW");

        deal(Constants._WETH, address(proxy), 1e18);

        // Supply
        vm.prank(_proxyOwner);
        proxy.execute{value: supplyParams.value}(_MORPHOUS, supplyParams.data);

        uint256 _totalBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).supplyBalance(Constants._WETH, _proxy);

        assertApproxEqAbs(_totalBalance, 1e18, 4);

        // Withdraw
        vm.prank(_proxyOwner);
        proxy.execute{value: withdrawParams.value}(_MORPHOUS, withdrawParams.data);

        _totalBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).supplyBalance(Constants._WETH, _proxy);

        assertEq(_totalBalance, 0);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Deposit + Borrow
    ///////////////////////////////////////////////////////////////

    function test_supply_borrow_aaveV2() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V2_SUPPLY_BORROW");

        deal(Constants._WETH, address(proxy), 1e18);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_MORPHOUS, params.data);

        (,, uint256 _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        (,, uint256 _totalBorrowed) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentBorrowBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 1e18);
        assertEq(_totalBorrowed, 1e18 / 2);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18 / 2, 4);
    }

    function test_supply_borrow_collateral_aaveV3() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V3_SUPPLY_BORROW_COLLATERAL");

        //deal(Constants._WETH, address(proxy), 1e18);
        deal(Constants._DAI, address(proxy), 1e24);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_MORPHOUS, params.data);

        uint256 _totalBorrowed = IMorphoLens(Constants._MORPHO_AAVE_V3).borrowBalance(Constants._WETH, _proxy);
        uint256 _totalBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).collateralBalance(Constants._DAI, _proxy);

        assertApproxEqAbs(_totalBalance, 1e24, 4);
        assertApproxEqAbs(_totalBorrowed, 1e18, 4);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18, 4);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Payback + Withdraw
    ///////////////////////////////////////////////////////////////

    function test_payback_withdraw_aaveV2() public {
        MethodParameters memory supplyBorrowParams = readFixture(json, "._AAVE_V2_SUPPLY_BORROW");
        MethodParameters memory paybackWithdrawParams = readFixture(json, "._AAVE_V2_PAYBACK_WITHDRAW");

        deal(Constants._WETH, address(proxy), 1e18);

        // Supply and borrow
        vm.prank(_proxyOwner);
        proxy.execute{value: supplyBorrowParams.value}(_MORPHOUS, supplyBorrowParams.data);

        (,, uint256 _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        (,, uint256 _totalBorrowed) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentBorrowBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 1e18);
        assertEq(_totalBorrowed, 1e18 / 2);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18 / 2, 4);

        // Payback and withdraw
        vm.prank(_proxyOwner);
        proxy.execute{value: paybackWithdrawParams.value}(_MORPHOUS, paybackWithdrawParams.data);

        (,, _totalSupplied) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        (,, _totalBorrowed) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentBorrowBalanceInOf(_poolToken, _proxy);

        assertEq(_totalSupplied, 0);
        assertEq(_totalBorrowed, 0);
        assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18, 4);
    }

    function test_payback_withdraw_collateral_aaveV3() public {
        MethodParameters memory supplyBorrowParams = readFixture(json, "._AAVE_V3_SUPPLY_BORROW_COLLATERAL");
        MethodParameters memory paybackWithdrawParams = readFixture(json, "._AAVE_V3_PAYBACK_WITHDRAW_COLLATERAL");

        deal(Constants._DAI, address(proxy), 1e25);
        deal(Constants._WETH, address(proxy), 1e25);
        deal(address(proxy), 1e25);
        //deal(Constants._WETH, address(proxy), 1e18);
        //deal(address(proxy), 10e18);

        // Supply and borrow
        vm.prank(_proxyOwner);
        proxy.execute{value: supplyBorrowParams.value}(_MORPHOUS, supplyBorrowParams.data);

        uint256 _totalBorrowed = IMorphoLens(Constants._MORPHO_AAVE_V3).borrowBalance(Constants._WETH, _proxy);
        uint256 _totalColBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).collateralBalance(Constants._DAI, _proxy);

        assertApproxEqAbs(_totalColBalance, 1e24, 4);
        assertApproxEqAbs(_totalBorrowed, 1e18, 4);
        //assertApproxEqAbs(ERC20(Constants._WETH).balanceOf(_proxy), 1e18, 4);

        // Payback and withdraw
        vm.prank(_proxyOwner);
        proxy.execute{value: paybackWithdrawParams.value}(_MORPHOUS, paybackWithdrawParams.data);

        _totalBorrowed = IMorphoLens(Constants._MORPHO_AAVE_V3).borrowBalance(Constants._WETH, _proxy);
        _totalColBalance = IMorphoLens(Constants._MORPHO_AAVE_V3).collateralBalance(Constants._DAI, _proxy);

        assertEq(_totalColBalance, 0);
        assertEq(_totalBorrowed, 0);
        assertApproxEqAbs(ERC20(Constants._DAI).balanceOf(_proxy), 1e25, 4);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Leverage / Folding
    ///////////////////////////////////////////////////////////////

    function test_leverage_aaveV2() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V2_LEVERAGE");

        deal(Constants._WETH, address(proxy), 2e18);
        deal(address(proxy), 1e18);

        vm.prank(_proxyOwner);
        proxy.execute{value: params.value}(_NEO, params.data);
    }

    ////////////////////////////////////////////////////////////////
    /// --- Deleverage / Unwind
    ///////////////////////////////////////////////////////////////
}
