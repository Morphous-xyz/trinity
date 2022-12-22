import axios from 'axios'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Token } from '../types'

import { ONE_INCH_API_URL } from '../constants'

export async function getOneInchPrices(tokenIn: Token, tokenOut: Token, amount: string, formated?: boolean) {
  const queryParams = {
    fromTokenAddress: tokenIn.address,
    toTokenAddress: tokenOut.address,
    amount: formated ? amount : formatUnits(parseUnits(amount, tokenIn.decimals), 0)
  }

  const searchString = new URLSearchParams(queryParams)
  const pricesURL = `${ONE_INCH_API_URL}/quote?${searchString}`

  try {
    const { data } = await axios.get<{ data }>(pricesURL)
    return data
  } catch (error) {
    const route = {
      toTokenAmount: '0'
    }
    return route
  }
}

export async function buildOneInchData(
  tokenIn: Token,
  tokenOut: Token,
  amount: string,
  slippage: number,
  user: string,
  formated?: boolean
) {
  const queryParams = {
    fromTokenAddress: tokenIn.address,
    toTokenAddress: tokenOut.address,
    amount: formated ? amount : formatUnits(parseUnits(amount, tokenIn.decimals), 0),
    fromAddress: user,
    slippage: (slippage / 100).toString(),
    disableEstimate: 'true'
  }

  const searchString = new URLSearchParams(queryParams)
  const swapURL = `${ONE_INCH_API_URL}/swap?${searchString}`

  let callData
  try {
    const { data } = await axios.get<{ data }>(swapURL)
    callData = data['tx'].data
  } catch (error) {}
  return callData
}
