import { expect, test } from 'vitest'
import { getAddress, toHex } from 'viem'
import { Trinity } from '../src/trinity'
import { DAI, PROXY_TEST_ADDRESS, WETH, WETH_AAVE } from './utils/constants'
import { parseUnits } from 'ethers/lib/utils'
import {
    AGGREGATOR_MODULE_ID,
    MORPHO_AAVE,
    MORPHO_MODULE_ID,
    TOKEN_ACTIONS_MODULE_ID,
    ZERO_EX_ROUTER,
} from '../src/constants'
import * as TrinityDecoder from './helpers/trinityDecoder'
import { getBalanceOf, transferToken, corruptToken } from 'helpers/erc20Helper'
import { testClient } from 'helpers/globals'



////////////////////////////////////////////////////////////////
/// --- FLASHLOAN
///////////////////////////////////////////////////////////////
test('executeFlashloan should be encoded and decoded correctly', () => {
    const _tokens = [DAI, WETH]
    const _amount = [parseUnits('1', 18), parseUnits('1', 18)]
    const _data = toHex('0x')
    const _isAave = true

    const calldata: any = Trinity.executeFlashloan(_tokens, _amount, _data, _isAave)

    const decoded = TrinityDecoder.decodeExecuteFlashloan(calldata)

    expect(decoded[0]).toStrictEqual(_tokens)
    expect(decoded[1]).toStrictEqual(_amount)
    expect(decoded[2]).toBe(_data)
    expect(decoded[3]).toBe(_isAave)
})

test('executeFlashloanWithReceiver should be encoded and decoded correctly', () => {
    const _tokensReceivers = [
        getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
        getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
    ]
    const _tokens = [DAI, WETH]
    const _amounts = [parseUnits('1', 18), parseUnits('1', 18)]
    const _data = toHex('0x')
    const _receiver = PROXY_TEST_ADDRESS
    const _isAave = true

    const calldata: any = Trinity.executeFlashloanWithReceiver(
        _tokensReceivers,
        _tokens,
        _amounts,
        _data,
        _receiver,
        _isAave
    )

    const decoded = TrinityDecoder.decodeExecuteFlashloanWithReceiver(calldata)

    expect(decoded[0]).toStrictEqual(_tokensReceivers)
    expect(decoded[1]).toStrictEqual(_tokens)
    expect(decoded[2]).toStrictEqual(_amounts)
    expect(decoded[3]).toBe(_data)
    expect(decoded[4]).toBe(_receiver)
    expect(decoded[5]).toBe(_isAave)
})


test('multicallFlashloan should be encoded and decoded correctly', () => {
    const _proxy = PROXY_TEST_ADDRESS
    const _deadline = 0

    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _onBehalf = PROXY_TEST_ADDRESS
    const _amount = parseUnits('1', 18)
    const _argPos = [0, 1]

    // encoding multiple actions
    const _calls = [
        Trinity.depositWETH(parseUnits('1', 18)),
        Trinity.supply(_market, _poolToken, _onBehalf, _amount),
    ]

    const calldata: any = Trinity.multicallFlashloan(_proxy, _deadline, _calls, _argPos)

    const decoded = TrinityDecoder.decodeMulticallFlashloan(calldata)

    expect(decoded[0]).toBe(_proxy)
    expect(Number(decoded[1])).toBe(Math.floor(Date.now() / 1000))
    expect(decoded[2]).toStrictEqual(_calls)
    expect(decoded[3].map((x: any) => Number(x))).toStrictEqual(_argPos)
});


////////////////////////////////////////////////////////////////
/// --- MULTICALL
///////////////////////////////////////////////////////////////
test('multicall should be encoded and decoded correctly', () => {
    const _deadline = 0
    const _calls = [toHex('0x'), toHex('0x')]
    const _argPos = [0, 1, 2, 3, 4]

    const calldata: any = Trinity.multicall(_deadline, _calls, _argPos)

    const decoded = TrinityDecoder.decodeMulticall(calldata)

    expect(Number(decoded[0])).toBe(Math.floor(Date.now() / 1000))

    expect(decoded[1]).toStrictEqual(_calls)

    expect(decoded[2].map((x: any) => Number(x))).toStrictEqual(_argPos)
})

test('multicallWithReceiver should be encoded and decoded correctly', () => { })

////////////////////////////////////////////////////////////////
/// --- MORPHO SUPPLY/WITHDRAW
///////////////////////////////////////////////////////////////

test('supply should be encoded and decoded correctly', () => {
    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _onBehalf = PROXY_TEST_ADDRESS
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.supply(_market, _poolToken, _onBehalf, _amount)

    const decoded = TrinityDecoder.decodeSupplyWithoutMaxGas(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_market)
    expect(decoded[2]).toBe(_poolToken)
    expect(decoded[3]).toBe(_onBehalf)
    expect(Number(decoded[4])).toBe(Number(_amount))

    const _maxGas = parseUnits('100', 18)

    const calldataWithMaxGas: any = Trinity.supply(_market, _poolToken, _onBehalf, _amount, _maxGas)

    const decodedWithMaxGas = TrinityDecoder.decodeSupplyWithMaxGas(calldataWithMaxGas)

    expect(decodedWithMaxGas[0]).toBe(MORPHO_MODULE_ID)
    expect(decodedWithMaxGas[1]).toBe(_market)
    expect(decodedWithMaxGas[2]).toBe(_poolToken)
    expect(decodedWithMaxGas[3]).toBe(_onBehalf)
    expect(Number(decodedWithMaxGas[4])).toBe(Number(_amount))
    expect(Number(decodedWithMaxGas[5])).toBe(Number(_maxGas))
})

test('supply (AaveV3) should be encoded and decoded correctly', () => {
    const _underlying = DAI
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS
    const _maxIterations = parseUnits('1', 1)

    const calldata: any = Trinity.supplyAaveV3(_underlying, _amount, _onBehalf, _maxIterations)

    const decoded = TrinityDecoder.decodeSupplyAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)
    expect(Number(decoded[4])).toBe(Number(_maxIterations))

})

test('supplyCollateral (AaveV3) should be encoded and decoded correctly', () => {
    const _underlying = DAI
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS

    const calldata: any = Trinity.supplyCollateralAaveV3(_underlying, _amount, _onBehalf)

    const decoded = TrinityDecoder.decodeSupplyCollateralAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)
})


test('withdraw should be encoded and decoded correctly', () => {
    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.withdraw(_market, _poolToken, _amount)

    const decoded = TrinityDecoder.decodeWithdraw(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_market)
    expect(decoded[2]).toBe(_poolToken)
    expect(Number(decoded[3])).toBe(Number(_amount))
})

test('withdraw (AaveV3) should be encoded and decoded correctly', () => {
    const _underlying = DAI
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS
    const _receiver = PROXY_TEST_ADDRESS
    const _maxIterations = parseUnits('1', 1)

    const calldata: any = Trinity.withdrawAaveV3(_underlying, _amount, _onBehalf, _receiver, _maxIterations)

    const decoded = TrinityDecoder.decodeWithdrawAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)
    expect(decoded[4]).toBe(_receiver)
    expect(Number(decoded[5])).toBe(Number(_maxIterations))

})

test('withdrawCollateral (AaveV3) should be encoded and decoded correctly', () => {
    const _underlying = DAI
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS
    const _receiver = PROXY_TEST_ADDRESS

    const calldata: any = Trinity.withdrawCollateralAaveV3(_underlying, _amount, _onBehalf, _receiver)

    const decoded = TrinityDecoder.decodeWithdrawCollateralAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)
    expect(decoded[4]).toBe(_receiver)
})

////////////////////////////////////////////////////////////////
/// --- MORPHO BORROW/REPAY
///////////////////////////////////////////////////////////////

test('borrow should be encoded and decoded correctly', () => {
    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.borrow(_market, _poolToken, _amount)

    const decoded = TrinityDecoder.decodeBorrowWithoutMaxGas(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_market)
    expect(decoded[2]).toBe(_poolToken)
    expect(Number(decoded[3])).toBe(Number(_amount))

    const _maxGas = parseUnits('100', 18)

    const calldataWithMaxGas: any = Trinity.borrow(_market, _poolToken, _amount, _maxGas)

    const decodedWithMaxGas = TrinityDecoder.decodeBorrowWithMaxGas(calldataWithMaxGas)

    expect(decodedWithMaxGas[0]).toBe(MORPHO_MODULE_ID)
    expect(decodedWithMaxGas[1]).toBe(_market)
    expect(decodedWithMaxGas[2]).toBe(_poolToken)
    expect(Number(decodedWithMaxGas[3])).toBe(Number(_amount))
    expect(Number(decodedWithMaxGas[4])).toBe(Number(_maxGas))
})

test('borrow with receiver should be encoded and decoded correctly', () => {
    const _underlying = WETH
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS
    const _receiver = PROXY_TEST_ADDRESS
    const _maxIterations = parseUnits('4', 0)

    const calldata: any = Trinity.borrowAaveV3(_underlying, _amount, _onBehalf, _receiver, _maxIterations)

    const decoded = TrinityDecoder.decodeBorrowWithReceiver(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)
    expect(decoded[4]).toBe(_receiver)
    expect(Number(decoded[5])).toBe(Number(_maxIterations))
})

test('repay should be encoded and decoded correctly', () => {
    const _market = MORPHO_AAVE
    const _poolToken = WETH_AAVE
    const _onBehalf = PROXY_TEST_ADDRESS
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.repay(_market, _poolToken, _onBehalf, _amount)

    const decoded = TrinityDecoder.decodeRepay(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_market)
    expect(decoded[2]).toBe(_poolToken)
    expect(decoded[3]).toBe(_onBehalf)
    expect(Number(decoded[4])).toBe(Number(_amount))
})


test('repay (AaveV3) should be encoded and decoded correctly', () => {
    const _underlying = WETH
    const _amount = parseUnits('1', 18)
    const _onBehalf = PROXY_TEST_ADDRESS

    const calldata: any = Trinity.repayAaveV3(_underlying, _amount, _onBehalf)

    const decoded = TrinityDecoder.decodeRepayAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_underlying)
    expect(Number(decoded[2])).toBe(Number(_amount))
    expect(decoded[3]).toBe(_onBehalf)

})

////////////////////////////////////////////////////////////////
/// --- MORPHO CLAIM REWARDS
///////////////////////////////////////////////////////////////

test('claim morpho tokens should be encoded and decoded correctly', () => {
    const _account = getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    const _claimable = parseUnits('0.000000000000000001', 18)
    const _proof = [toHex('testProofA', { size: 32 }), toHex('testProofB', { size: 32 })]

    const calldata: any = Trinity.claim(_account, _claimable, _proof)

    const decoded = TrinityDecoder.decodeClaim(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_account)
    expect(Number(decoded[2])).toBe(Number(_claimable))

    expect(decoded[3][0]).toBe(_proof[0])
    expect(decoded[3][1]).toBe(_proof[1])
})

test('claim rewards should be encoded and decoded correctly', () => {
    const _market = MORPHO_AAVE
    const _poolTokens = [WETH_AAVE] // WETH market
    const _tradeForMorphoToken = false

    const calldata: any = Trinity.claimRewards(_market, _poolTokens, _tradeForMorphoToken)

    const decoded = TrinityDecoder.decodeClaimRewards(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1]).toBe(_market)
    expect(decoded[2][0]).toBe(_poolTokens[0])
    expect(decoded[3]).toBe(_tradeForMorphoToken)
})

test('claim rewards (AaveV3) should be encoded and decoded correctly', () => {
    const _assets = [getAddress(WETH)]
    const _onBehalf = PROXY_TEST_ADDRESS

    const calldata: any = Trinity.claimRewardsAaveV3(_assets, _onBehalf)

    const decoded = TrinityDecoder.decodeClaimRewardsAaveV3(calldata)

    expect(decoded[0]).toBe(MORPHO_MODULE_ID)
    expect(decoded[1][0]).toBe(_assets[0])
    expect(decoded[2]).toBe(_onBehalf)
})

////////////////////////////////////////////////////////////////
/// --- TOKENS ACTIONS
///////////////////////////////////////////////////////////////

test('approve should be encoded and decoded correctly', () => {
    const _token = WETH
    const _to = getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.approveToken(_token, _to, _amount)

    const decoded = TrinityDecoder.decodeApproveToken(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(decoded[1]).toBe(_token)
    expect(decoded[2]).toBe(_to)
    expect(Number(decoded[3])).toBe(Number(_amount))
})

test('transferFrom should be encoded and decoded correctly', () => {
    const _token = WETH
    const _from = getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.transferFrom(_token, _from, _amount)

    const decoded = TrinityDecoder.decodeTransferFrom(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(decoded[1]).toBe(_token)
    expect(decoded[2]).toBe(_from)
    expect(Number(decoded[3])).toBe(Number(_amount))
})

test('transfer should be encoded and decoded correctly', () => {
    const _token = WETH
    const _from = getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.transfer(_token, _from, _amount)

    const decoded = TrinityDecoder.decodeTransfer(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(decoded[1]).toBe(_token)
    expect(decoded[2]).toBe(_from)
    expect(Number(decoded[3])).toBe(Number(_amount))
})

test('depositSTETH should be encoded and decoded correctly', () => {
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.depositSTETH(_amount)

    const decoded = TrinityDecoder.decodeDepositSTETH(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(Number(decoded[1])).toBe(Number(_amount))
})

test('depositWETH should be encoded and decoded correctly', () => {
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.depositWETH(_amount)

    const decoded = TrinityDecoder.decodeDepositWETH(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(Number(decoded[1])).toBe(Number(_amount))
})

test('withdrawWETH should be encoded and decoded correctly', () => {
    const _amount = parseUnits('1', 18)

    const calldata: any = Trinity.withdrawWETH(_amount)

    const decoded = TrinityDecoder.decodeWithdrawWETH(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(Number(decoded[1])).toBe(Number(_amount))
})

test('balanceInOf should be encoded and decoded correctly', () => {
    const _token = WETH
    const _account = getAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')

    const calldata: any = Trinity.balanceInOf(_token, _account)

    const decoded = TrinityDecoder.decodeBalanceInOf(calldata)

    expect(decoded[0]).toBe(TOKEN_ACTIONS_MODULE_ID)
    expect(decoded[1]).toBe(_token)
    expect(decoded[2]).toBe(_account)
})

////////////////////////////////////////////////////////////////
/// --- AGGREGATOR
///////////////////////////////////////////////////////////////

test('exchange should be encoded and decoded correctly', () => {
    const _aggregator = ZERO_EX_ROUTER
    const _srcToken = WETH
    const _destToken = DAI
    const _underlyingAmount = parseUnits('1', 18)
    const _callData = '0x'

    const calldata: any = Trinity.exchange(_aggregator, _srcToken, _destToken, _underlyingAmount, _callData)

    const decoded = TrinityDecoder.decodeExchange(calldata)

    expect(decoded[0]).toBe(AGGREGATOR_MODULE_ID)
    expect(decoded[1]).toBe(_aggregator)
    expect(decoded[2]).toBe(_srcToken)
    expect(decoded[3]).toBe(_destToken)
    expect(Number(decoded[4])).toBe(Number(_underlyingAmount))
    expect(decoded[5]).toBe(_callData)
})
