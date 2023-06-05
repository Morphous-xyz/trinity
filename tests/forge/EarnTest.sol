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

    ////////////////////////////////////////////////////////////////
    /// --- Deposit / Borrow
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

    function test_supply_borrow_aaveV3() public {
        MethodParameters memory params = readFixture(json, "._AAVE_V3_SUPPLY_BORROW");

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
}
