// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.20;

import "forge-std/Test.sol";

struct MethodParametersRaw {
    bytes data;
    string value;
}

struct MethodParameters {
    bytes data;
    uint256 value;
}

contract Interop is Test {
    function readFixture(string memory json, string memory key)
        internal
        pure
        returns (MethodParameters memory params)
    {
        // stdjson awkwardly doesn't currently parse string ints
        // so have to do a lil hack to read as string then parse
        // ref https://book.getfoundry.sh/cheatcodes/parse-json#decoding-json-objects-a-tip
        MethodParametersRaw memory raw = abi.decode(vm.parseJson(json, key), (MethodParametersRaw));
        params = MethodParameters(raw.data, vm.parseUint(raw.value));
    }
}
