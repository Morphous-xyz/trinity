import { ZERO_EX_ROUTER, INCH_ROUTER, ODOS_ROUTER } from "../constants";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { buildOneInchData, getOneInchPrices } from "./oneInch";
import { buildZeroExData, getZeroExPrices } from "./zeroEx";
import { Token } from "types";
import { buildOdosData, getOdosPrices } from "./odos";

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
		switch (aggregator) {
			case ZERO_EX_ROUTER: {
				const price = await getZeroExPrices(tokenIn, tokenOut, formattedValue);
				return {
					...price,
					destAmount: price["buyAmount"],
				};
			}
			case INCH_ROUTER: {
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

			}
			case ODOS_ROUTER: {
				const tokenWAmount = {
					...tokenIn,
					amount: formattedValue,
				};

				const price = await getOdosPrices(
					[tokenWAmount],
					[tokenOut],
				);
				return {
					...price,
					destAmount: price["outValues"],
				};
			}
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
	slippage: number,
	user: string,
	formatted?: boolean,
) => {
	if (tokenIn !== tokenOut) {
		const formattedValue = formatted
			? value
			: formatUnits(parseUnits(value, tokenIn.decimals), 0);
		switch (aggregator) {
			case ZERO_EX_ROUTER: {
				return await buildZeroExData(
					tokenIn,
					tokenOut,
					formattedValue,
				);
			}
			case INCH_ROUTER: {
				return await buildOneInchData(
					tokenIn,
					tokenOut,
					formattedValue,
					slippage,
					user,
					true,
				);
			}
			case ODOS_ROUTER: {
				const tokenWAmount = {
					...tokenIn,
					amount: formattedValue,
				};

				return await buildOdosData(
					[tokenWAmount],
					[tokenOut],
				);
			}

			default:
				throw new Error("Invalid aggregator");
		}
	}
	return "";
};
