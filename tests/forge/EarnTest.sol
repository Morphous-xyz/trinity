// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.20;

import "tests/forge/Test.sol";

import {IDSProxy} from "morphous/interfaces/IDSProxy.sol";

interface IMakerRegistry {
    function build() external returns (address proxy);
}

contract EarnTest is Interop {
    using stdJson for string;

    string json;
    IDSProxy proxy;

    address internal constant _MAKER_REGISTRY = 0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4;

    address internal constant _DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    address internal constant _NEO = 0x55555555D7b62E4Bf2080CB1912861da2cb91f0e;
    address public constant _FLASHLOAN = 0x666666660b6296b3D37dA3F7eFC7D475F95b6211;
    address internal constant _MORPHOUS = 0x44444444F11b8e48CbB050Db744B0aA810ca0D6a;

    function setUp() public {
        proxy = IDSProxy(IMakerRegistry(_MAKER_REGISTRY).build());

        string memory root = vm.projectRoot();
        json = vm.readFile(string.concat(root, "/tests/forge/test-calldata.json"));
    }

    function test_setUpProxy() public {
        assertEq(proxy.owner(), address(this));
    }

    function test_executeFlashloan() public {
        MethodParameters memory params = readFixture(json, "._EXECUTE_FLASHLOAN");
        /// Setup Proxy
        /// proxy.execute(address(_NEO), params.data);
    }
}
