import { AUGUSTUS, INCH_ROUTER } from '../constants'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { buildOneInchData, getOneInchPrices } from './oneInch'
import { buildParaswapData, getParaswapPrices } from './paraswap'

export const getPrices = async (aggregator, tokenIn, tokenOut, value, formatted?: boolean) => {
  if (tokenIn !== tokenOut) {
    const formattedValue = formatted ? value : formatUnits(parseUnits(value, tokenIn.decimals), 0)
    switch (aggregator) {
      case AUGUSTUS:
        return await getParaswapPrices(tokenIn, tokenOut, formattedValue, true)
      case INCH_ROUTER:
        const price = await getOneInchPrices(tokenIn, tokenOut, formattedValue, true)
        return {
          ...price,
          destAmount: price['toTokenAmount']
        }
      default:
        return {}
    }
  }
  return {}
}

export const buildExchangeData = async (
  aggregator,
  tokenIn,
  tokenOut,
  value,
  route,
  slippage,
  user,
  formatted?: boolean
) => {
  if (tokenIn !== tokenOut) {
    const formattedValue = formatted ? value : formatUnits(parseUnits(value, tokenIn.decimals), 0)
    switch (aggregator) {
      case AUGUSTUS:
        return await buildParaswapData(tokenIn, tokenOut, formattedValue, route, slippage, user, true)
      case INCH_ROUTER:
        return await buildOneInchData(tokenIn, tokenOut, formattedValue, slippage, user, true)
      default:
        return ''
    }
  }
  return ''
}
