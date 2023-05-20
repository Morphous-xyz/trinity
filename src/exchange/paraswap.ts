import axios from "axios";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { Token } from "../types";

import { PARASWAP_API_URL } from "../constants";

export async function getParaswapPrices(
	tokenIn: Token,
	tokenOut: Token,
	amount: string,
	formated?: boolean,
) {
	const queryParams = {
		srcToken: tokenIn.address,
		destToken: tokenOut.address,
		srcDecimals: tokenIn.decimals.toString(),
		destDecimals: tokenOut.decimals.toString(),
		amount: formated
			? amount
			: formatUnits(parseUnits(amount, tokenIn.decimals), 0),
		side: "SELL",
		network: "1",
	};

	const searchString = new URLSearchParams(queryParams);
	const pricesURL = `${PARASWAP_API_URL}/prices/?${searchString}`;

	try {
		const {
			data: { priceRoute },
		} = await axios.get<{ priceRoute }>(pricesURL);
		return priceRoute;
	} catch (error) {
		const route = {
			destAmount: "0",
		};
		return route;
	}
}

export async function getParaswapBuyPrices(
	tokenIn: Token,
	tokenOut: Token,
	amount: string,
) {
	const queryParams = {
		srcToken: tokenIn.address,
		destToken: tokenOut.address,
		srcDecimals: tokenIn.decimals.toString(),
		destDecimals: tokenOut.decimals.toString(),
		amount: amount,
		side: "BUY",
		network: "1",
	};

	const searchString = new URLSearchParams(queryParams);
	const pricesURL = `${PARASWAP_API_URL}/prices/?${searchString}`;

	try {
		const {
			data: { priceRoute },
		} = await axios.get<{ priceRoute }>(pricesURL);
		return priceRoute;
	} catch (error) {
		const route = {
			destAmount: "0",
		};
		return route;
	}
}

export async function buildParaswapData(
	tokenIn: Token,
	tokenOut: Token,
	amount: string,
	priceRoute: any,
	slippage: number,
	user: string,
	formated?: boolean,
) {
	const txURL = `${PARASWAP_API_URL}/transactions/1?ignoreChecks=true`;
	amount = formated
		? amount
		: formatUnits(parseUnits(amount, tokenIn.decimals), 0);

	const txConfig = {
		priceRoute: priceRoute,
		srcToken: tokenIn.address,
		destToken: tokenOut.address,
		slippage: slippage,
		srcAmount: amount,
		userAddress: user,
	};

	let callData;
	try {
		const { data } = await axios.post(txURL, txConfig);
		callData = data.data;
	} catch (error) {}
	return callData;
}

export async function buildParaswapBuyData(
	tokenIn: Token,
	tokenOut: Token,
	amount: string,
	priceRoute: any,
	slippage: number,
	user: string,
) {
	const txURL = `${PARASWAP_API_URL}/transactions/1?ignoreChecks=true`;

	const txConfig = {
		priceRoute: priceRoute,
		srcToken: tokenIn.address,
		destToken: tokenOut.address,
		slippage: slippage,
		destAmount: amount,
		userAddress: user,
	};

	let callData;
	try {
		const { data } = await axios.post(txURL, txConfig);
		callData = data.data;
	} catch (error) {}
	return callData;
}
