import { BigNumber } from '@ethersproject/bignumber'
import { AUGUSTUS, FLASHLOAN, MORPHEUS, NEO } from './constants'
import { Trinity } from './trinity'
import { ethers } from 'ethers'
import { MatrixData, Token } from './types'
import { buildExchangeData, getPrices } from './exchange'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { buildParaswapBuyData, getParaswapBuyPrices } from './exchange/paraswap'

export abstract class Matrix {
  ////////////////////////////////////////////////////////////////
  /// --- SIMPLE ACTIONS
  ///////////////////////////////////////////////////////////////

  public static deposit(
    morphoMarketAddress: string,
    txDeadline: number,
    fromWallet: boolean,
    marketAddress: string,
    token: Token,
    address: string,
    smartWallet: string,
    value: BigNumber
  ): MatrixData {
    const calldata = Trinity.multicall(
      txDeadline,
      [
        fromWallet ? Trinity.transferFrom(token.address, address, value) : '',
        Trinity.supply(morphoMarketAddress, marketAddress, smartWallet, value)
      ].filter(i => i !== '')
    )

    return {
      to: MORPHEUS,
      data: calldata
    }
  }

  public static borrow(
    morphoMarketAddress: string,
    txDeadline: number,
    toWallet: boolean,
    marketAddress: string,
    token: Token,
    address: string,
    value: BigNumber
  ): MatrixData {
    const calldata = Trinity.multicall(
      txDeadline,
      [
        Trinity.borrow(morphoMarketAddress, marketAddress, value),
        toWallet ? Trinity.transfer(token.address, address, value) : ''
      ].filter(i => i !== '')
    )

    return {
      to: MORPHEUS,
      data: calldata
    }
  }

  public static withdraw(
    morphoMarketAddress: string,
    txDeadline: number,
    toWallet: boolean,
    marketAddress: string,
    token: Token,
    address: string,
    value: BigNumber,
    max: boolean
  ): MatrixData {
    const calls = [Trinity.withdraw(morphoMarketAddress, marketAddress, max ? ethers.constants.MaxUint256 : value)]
    const calldata = toWallet
      ? Trinity.multicallWithReceiver([token.address], txDeadline, calls, address)
      : Trinity.multicall(txDeadline, calls)

    return {
      to: toWallet ? NEO : MORPHEUS,
      data: calldata
    }
  }

  public static repay(
    morphoMarketAddress: string,
    txDeadline: number,
    fromWallet: boolean,
    marketAddress: string,
    token: Token,
    address: string,
    smartWallet: string,
    value: BigNumber,
    max: boolean
  ): MatrixData {
    const calldata = Trinity.multicall(
      txDeadline,
      [
        fromWallet ? Trinity.transferFrom(token.address, address, value) : '',
        Trinity.repay(morphoMarketAddress, marketAddress, smartWallet, max ? ethers.constants.MaxUint256 : value)
      ].filter(i => i !== '')
    )

    return {
      to: MORPHEUS,
      data: calldata
    }
  }

  ////////////////////////////////////////////////////////////////
  /// --- DOUBLE ACTIONS
  ///////////////////////////////////////////////////////////////

  public static depositBorrow(
    morphoMarketAddress: string,
    txDeadline: number,
    fromWallet: boolean,
    toWallet: boolean,
    supplyMarketAddress: any,
    borrowMarketAddress: any,
    supplyToken: Token,
    borrowToken: Token,
    address: string,
    smartWallet: string,
    supplyValue: BigNumber,
    borrowValue: BigNumber
  ): MatrixData {
    const calldata = Trinity.multicall(
      txDeadline,
      [
        fromWallet ? Trinity.transferFrom(supplyToken.address, address, supplyValue) : '',
        Trinity.supply(morphoMarketAddress, supplyMarketAddress, smartWallet, supplyValue),
        Trinity.borrow(morphoMarketAddress, borrowMarketAddress, borrowValue),
        toWallet ? Trinity.transfer(borrowToken.address, address, borrowValue) : ''
      ].filter(i => i !== '')
    )

    return {
      to: MORPHEUS,
      data: calldata
    }
  }

  public static paybackWithdraw(
    morphoMarketAddress: string,
    txDeadline: number,
    fromWallet: boolean,
    toWallet: boolean,
    paybackMarketAddress: any,
    withdrawMarketAddress: any,
    paybackToken: Token,
    withdrawToken: Token,
    address: string,
    smartWallet: string,
    paybackValue: BigNumber,
    withdrawValue: BigNumber,
    maxPayback: boolean,
    maxWithdraw: boolean
  ): MatrixData {
    const calls = [
      fromWallet ? Trinity.transferFrom(paybackToken.address, address, paybackValue) : '',
      Trinity.repay(
        morphoMarketAddress,
        paybackMarketAddress,
        smartWallet,
        maxPayback ? ethers.constants.MaxUint256 : paybackValue
      ),
      Trinity.withdraw(
        morphoMarketAddress,
        withdrawMarketAddress,
        maxWithdraw ? ethers.constants.MaxUint256 : withdrawValue
      )
    ].filter(i => i !== '')
    const calldata = toWallet
      ? Trinity.multicallWithReceiver([withdrawToken.address], txDeadline, calls, address)
      : Trinity.multicall(txDeadline, calls)

    return {
      to: toWallet ? NEO : MORPHEUS,
      data: calldata
    }
  }

  ////////////////////////////////////////////////////////////////
  /// --- LEVERAGE
  ///////////////////////////////////////////////////////////////

  public static async leverage(
    morphoMarketAddress: string,
    txDeadline: number,
    fromWallet: boolean,
    supplyMarketAddress: any,
    borrowMarketAddress: any,
    supplyToken: Token,
    borrowToken: Token,
    address: string,
    smartWallet: string,
    supplyValue: BigNumber,
    borrowValue: BigNumber,
    aggregator: string,
    slippage: number
  ): Promise<MatrixData> {
    const exchangeRoute = await getPrices(aggregator, borrowToken, supplyToken, formatUnits(borrowValue, 0), true)
    const exchangeCalldata = await buildExchangeData(
      aggregator,
      borrowToken,
      supplyToken,
      formatUnits(borrowValue, 0),
      exchangeRoute,
      slippage,
      smartWallet,
      true
    )

    const actionsCallData = Trinity.multicallFlashloan(
      smartWallet,
      txDeadline,
      [
        fromWallet ? Trinity.transferFrom(supplyToken.address, address, supplyValue) : '',
        supplyMarketAddress !== borrowMarketAddress
          ? Trinity.exchange(aggregator, borrowToken.address, supplyToken.address, borrowValue, exchangeCalldata)
          : '',
        Trinity.supply(
          morphoMarketAddress,
          supplyMarketAddress,
          smartWallet,
          supplyValue.add(
            supplyMarketAddress !== borrowMarketAddress ? parseUnits(exchangeRoute['destAmount'], 0) : borrowValue
          )
        ),
        Trinity.borrow(morphoMarketAddress, borrowMarketAddress, borrowValue),
        Trinity.transfer(borrowToken.address, FLASHLOAN, borrowValue)
      ].filter(i => i !== '')
    )
    const calldata = Trinity.executeFlashloan([borrowToken.address], [borrowValue], actionsCallData, false)

    return {
      to: NEO,
      data: calldata
    }
  }

  public static async deleverage(
    morphoMarketAddress: string,
    txDeadline: number,
    toWallet: boolean,
    paybackMarketAddress: any,
    withdrawMarketAddress: any,
    paybackToken: Token,
    withdrawToken: Token,
    address: string,
    smartWallet: string,
    paybackValue: BigNumber,
    withdrawValue: BigNumber,
    slippage: number,
    max: boolean
  ): Promise<MatrixData> {
    const flashloanAmount = paybackValue.add(paybackValue.div(100))
    const paraswapRoute =
      paybackMarketAddress !== withdrawMarketAddress
        ? await getParaswapBuyPrices(withdrawToken, paybackToken, formatUnits(paybackValue, 0))
        : {}
    const paraswapCalldata =
      paybackMarketAddress !== withdrawMarketAddress
        ? await buildParaswapBuyData(
            withdrawToken,
            paybackToken,
            formatUnits(paybackValue, 0),
            paraswapRoute,
            slippage,
            smartWallet,
            true
          )
        : ''

    const actionsCallData = Trinity.multicallFlashloan(
      smartWallet,
      txDeadline,
      [
        Trinity.repay(
          morphoMarketAddress,
          paybackMarketAddress,
          smartWallet,
          max ? ethers.constants.MaxUint256 : paybackValue
        ),
        Trinity.withdraw(morphoMarketAddress, withdrawMarketAddress, max ? ethers.constants.MaxUint256 : withdrawValue),
        paybackMarketAddress !== withdrawMarketAddress
          ? Trinity.exchange(
              AUGUSTUS,
              withdrawToken.address,
              paybackToken.address,
              ethers.constants.MaxUint256,
              paraswapCalldata
            )
          : '',
        Trinity.transfer(paybackToken.address, FLASHLOAN, flashloanAmount)
      ].filter(i => i !== '')
    )
    const calldata = toWallet
      ? Trinity.executeFlashloanWithReceiver(
          [withdrawToken.address],
          [paybackToken.address],
          [flashloanAmount],
          actionsCallData,
          address,
          false
        )
      : Trinity.executeFlashloan([paybackToken.address], [flashloanAmount], actionsCallData, false)

    return {
      to: NEO,
      data: calldata
    }
  }
}
