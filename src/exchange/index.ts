import { AUGUSTUS, INCH_ROUTER } from "../constants";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { buildOneInchData, getOneInchPrices } from "./oneInch";
import { buildParaswapData, getParaswapPrices } from "./paraswap";
import { Token } from "types";

export const getPrices = async (
	aggregator: string,
	tokenIn: Token,
	tokenOut: Token,
	value: string,
	formatted?: boolean,
) => {
	if (tokenIn !== tokenOut) {
		const formattedValue = formatted
			? value
			: formatUnits(parseUnits(value, tokenIn.decimals), 0);
		console.log("getPrices", formattedValue);
		switch (aggregator) {
			case AUGUSTUS:
				return await getParaswapPrices(tokenIn, tokenOut, formattedValue, true);
			case INCH_ROUTER:
				const price = await getOneInchPrices(
					tokenIn,
					tokenOut,
					formattedValue,
					true,
				);
				return {
					...price,
					destAmount: price["toTokenAmount"],
				};
			default:
				return {};
		}
	}
	return {};
};

export const buildExchangeData = async (
	aggregator: string,
	tokenIn: Token,
	tokenOut: Token,
	value: string,
	route: any,
	slippage: number,
	user: string,
	formatted?: boolean,
) => {
	if (tokenIn !== tokenOut) {
		const formattedValue = formatted
			? value
			: formatUnits(parseUnits(value, tokenIn.decimals), 0);
		console.log("buildExchangeData", formattedValue);
		switch (aggregator) {
			case AUGUSTUS:
				return await buildParaswapData(
					tokenIn,
					tokenOut,
					formattedValue,
					route,
					slippage,
					user,
					true,
				);
			case INCH_ROUTER:
				return await buildOneInchData(
					tokenIn,
					tokenOut,
					formattedValue,
					slippage,
					user,
					true,
				);
			default:
				return "";
		}
	}
	return "";
};
