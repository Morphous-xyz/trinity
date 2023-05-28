import { WETH_AAVE } from "utils/constants";
import { MORPHEUS, MORPHO_AAVE } from "../../src/constants";
import { test } from "vitest";
import { Address, getAddress, getContract, parseAbiItem } from "viem";
import { publicClient, testClient, walletClient } from "helpers/globals";
import { Trinity } from "trinity";
import { BytesLike, parseUnits } from "ethers/lib/utils";
import { corruptToken, getBalanceOf, transferToken } from "helpers/erc20Helper";


/*
*        address _proxy = address(proxy);
        // Supply _userData.
        address _market = Constants._MORPHO_AAVE;
        address _poolToken = 0x030bA81f1c18d280636F32af80b9AAd02Cf0854e; // WETH Market
        uint256 _amount = 1e18;

        // Flashloan _userData.
        uint256 _deadline = block.timestamp + 15;

        bytes[] memory _calldata = new bytes[](2);
        _calldata[0] =
            abi.encode(Constants._TOKEN_ACTIONS_MODULE, abi.encodeWithSignature("depositWETH(uint256)", _amount));
        _calldata[1] = abi.encode(
            Constants._MORPHO_MODULE,
            abi.encodeWithSignature("supply(address,address,address,uint256)", _market, _poolToken, _proxy, _amount)
        );

        uint256[] memory _argPos = new uint256[](2);

        bytes memory _proxyData =
            abi.encodeWithSignature("multicall(uint256,bytes[],uint256[])", _deadline, _calldata, _argPos);
        proxy.execute{value: _amount}(address(morpheous), _proxyData);

        (,, uint256 _totalBalance) = IMorphoLens(_MORPHO_AAVE_LENS).getCurrentSupplyBalanceInOf(_poolToken, _proxy);
        assertApproxEqAbs(_totalBalance, _amount, 1);
*/


test('corrupt token', async () => {
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    const USDC_HOLDER = "0x7713974908Be4BEd47172370115e8b1219F4A5f0"
    const recipient = getAddress('0x14dbf58edc1a1f7910d5d59dc660fd0f263f3214')

    console.log(await getBalanceOf({ token: USDC, account: recipient }));

    await testClient.impersonateAccount({
        address: USDC_HOLDER,
    });


    const amount = BigInt("10")

    await transferToken({
        token: USDC,
        account: USDC_HOLDER,
        recipient: recipient,
        amount: amount
    })

    console.log(await getBalanceOf({ token: USDC, account: recipient }));

    await corruptToken({
        token: USDC,
        recipient: recipient,
        amount: BigInt("999999999999")
    })

    console.log(await getBalanceOf({ token: USDC, account: recipient }));

});

// TODO : Fix
test.only('should correctly supply', async () => {
    const _abi = [
        {
            "inputs": [],
            "name": "build",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "proxy",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

    const { result } = await publicClient.simulateContract({
        address: '0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4',
        abi: _abi,
        functionName: 'build',
        account: '0x14dbf58edc1a1f7910d5d59dc660fd0f263f3214',
    })

    const proxy = result as Address;

    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _onBehalf = result
    const _amount = parseUnits('1', 18)

    const calldata: BytesLike = Trinity.supply(_market, _poolToken, proxy, _amount)

    // proxy.execute{value: _amount}(address(morpheous), _proxyData);

    // function execute(address _target, bytes memory _data) external payable returns (bytes32);

    const _abi2 = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_target",
                    "type": "address"
                },
                {
                    "internalType": "bytes",
                    "name": "_data",
                    "type": "bytes"
                }
            ],
            "name": "execute",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "result",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        }
    ]

    const { result: result2 } = await publicClient.simulateContract({
        address: proxy,
        abi: _abi2,
        functionName: 'execute',
        account: '0x14dbf58edc1a1f7910d5d59dc660fd0f263f3214',
        args: [MORPHEUS, calldata]
    })

    console.log(result2)
});
