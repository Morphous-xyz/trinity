pragma solidity 0.8.20;

import "tests/forge/Test.sol";

import {IDSProxy} from "morphous/interfaces/IDSProxy.sol";

interface IMakerRegistry {
    function build() external returns (address proxy);
}

contract BaseTest is Interop {
    using stdJson for string;

    string json;
    IDSProxy proxy;

    address internal constant _MORPHO_AAVE_LENS = 0x507fA343d0A90786d86C7cd885f5C49263A91FF4;
    address internal constant _MORPHO_COMPOUND_LENS = 0x930f1b46e1D081Ec1524efD95752bE3eCe51EF67;

    address internal constant _MAKER_REGISTRY = 0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4;

    address internal constant _DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    address internal constant _NEO = 0x55555555D7b62E4Bf2080CB1912861da2cb91f0e;
    address internal constant _FLASHLOAN = 0x666666660b6296b3D37dA3F7eFC7D475F95b6211;
    address internal constant _MORPHOUS = 0x44444444F11b8e48CbB050Db744B0aA810ca0D6a;

    address internal constant _proxy = 0x43D428245483A502df263234b56B238c532c93Dd;
    address internal constant _proxyOwner = 0x98Bac71943d8aa2E7F620f0EB2e620A8F7ea4E8b;

    function setUp() public virtual {
        proxy = IDSProxy(_proxy);

        deal(_proxyOwner, 10e18);

        string memory root = vm.projectRoot();
        json = vm.readFile(string.concat(root, "/tests/forge/test-calldata.json"));
    }
}
