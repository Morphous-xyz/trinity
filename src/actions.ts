import { BigNumber } from "@ethersproject/bignumber";
import { ZERO_EX_ROUTER, FLASHLOAN, MORPHEUS, NEO } from "./constants";
import { Trinity } from "./trinity";
import { ethers } from "ethers";
import { ActionsData, Token } from "./types";
import { buildExchangeData, getPrices } from "./exchange";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import {
	buildParaswapBuyData,
	getParaswapBuyPrices,
} from "./exchange/paraswap";

/// --- Class used for building tx calldatas
/// - Using Trinity
export abstract class Actions {
	////////////////////////////////////////////////////////////////
	/// --- SIMPLE ACTIONS
	///////////////////////////////////////////////////////////////

	public static deposit(
		aaveV3: boolean,
		morphoMarketAddress: string,
		txDeadline: number,
		fromWallet: boolean,
		marketAddress: string,
		token: Token,
		address: string,
		smartWallet: string,
		value: BigNumber,
		argPos: number[],
		maxIterations?: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet ? Trinity.transferFrom(token.address, address, value) : "",
				aaveV3 ? Trinity.supplyAaveV3(morphoMarketAddress, value, smartWallet, maxIterations ? maxIterations : parseUnits("4")) :
					Trinity.supply(morphoMarketAddress, marketAddress, smartWallet, value),
			].filter((i) => i !== ""),
			argPos,
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}

	public static borrow(
		morphoMarketAddress: string,
		txDeadline: number,
		toWallet: boolean,
		marketAddress: string,
		token: Token,
		address: string,
		value: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				Trinity.borrow(morphoMarketAddress, marketAddress, value),
				toWallet ? Trinity.transfer(token.address, address, value) : "",
			].filter((i) => i !== ""),
			[0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}

	public static withdraw(
		morphoMarketAddress: string,
		txDeadline: number,
		toWallet: boolean,
		marketAddress: string,
		token: Token,
		address: string,
		value: BigNumber,
		max: boolean,
	): ActionsData {
		const calls = [
			Trinity.withdraw(
				morphoMarketAddress,
				marketAddress,
				max ? ethers.constants.MaxUint256 : value,
			),
		];
		const calldata = toWallet
			? Trinity.multicallWithReceiver(
				[token.address],
				txDeadline,
				calls,
				[0],
				address,
			)
			: Trinity.multicall(txDeadline, calls, [0]);

		return {
			to: toWallet ? NEO : MORPHEUS,
			data: calldata,
		};
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
		max: boolean,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet ? Trinity.transferFrom(token.address, address, value) : "",
				Trinity.repay(
					morphoMarketAddress,
					marketAddress,
					smartWallet,
					max ? ethers.constants.MaxUint256 : value,
				),
			].filter((i) => i !== ""),
			[0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
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
		borrowValue: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet
					? Trinity.transferFrom(supplyToken.address, address, supplyValue)
					: "",
				Trinity.supply(
					morphoMarketAddress,
					supplyMarketAddress,
					smartWallet,
					supplyValue,
				),
				Trinity.borrow(morphoMarketAddress, borrowMarketAddress, borrowValue),
				toWallet
					? Trinity.transfer(borrowToken.address, address, borrowValue)
					: "",
			].filter((i) => i !== ""),
			[0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
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
		maxWithdraw: boolean,
	): ActionsData {
		const calls = [
			fromWallet
				? Trinity.transferFrom(paybackToken.address, address, paybackValue)
				: "",
			Trinity.repay(
				morphoMarketAddress,
				paybackMarketAddress,
				smartWallet,
				maxPayback ? ethers.constants.MaxUint256 : paybackValue,
			),
			Trinity.withdraw(
				morphoMarketAddress,
				withdrawMarketAddress,
				maxWithdraw ? ethers.constants.MaxUint256 : withdrawValue,
			),
		].filter((i) => i !== "");
		const calldata = toWallet
			? Trinity.multicallWithReceiver(
				[withdrawToken.address],
				txDeadline,
				calls,
				[0],
				address,
			)
			: Trinity.multicall(txDeadline, calls, [0]);

		return {
			to: toWallet ? NEO : MORPHEUS,
			data: calldata,
		};
	}

	////////////////////////////////////////////////////////////////
	/// --- LEVERAGE
	///////////////////////////////////////////////////////////////

	public static async leverage(
		morphoMarketAddress: string,
		txDeadline: number,
		fromWallet: boolean,
		collateralMarketAddress: any,
		debtMarketAddress: any,
		collateralToken: Token,
		debtToken: Token,
		address: string,
		smartWallet: string,
		collateralValue: BigNumber,
		debtValue: BigNumber,
		aggregator: string,
		slippage: number,
		argPosForMulticall: number[],
	): Promise<ActionsData> {
		const exchangeRoute = await getPrices(
			aggregator,
			debtToken,
			collateralToken,
			formatUnits(debtValue, 0),
			true,
		);
		const exchangeCalldata = await buildExchangeData(
			aggregator,
			debtToken,
			collateralToken,
			formatUnits(debtValue, 0),
			exchangeRoute,
			slippage,
			smartWallet,
			true,
		);

		const actionsCallData = Trinity.multicallFlashloan(
			smartWallet,
			txDeadline,
			[
				fromWallet
					? Trinity.transferFrom(
						collateralToken.address,
						address,
						collateralValue,
					)
					: "",
				collateralMarketAddress !== debtMarketAddress
					? Trinity.exchange(
						aggregator,
						debtToken.address,
						collateralToken.address,
						debtValue,
						exchangeCalldata,
					)
					: "",
				Trinity.supply(
					morphoMarketAddress,
					collateralMarketAddress,
					smartWallet,
					collateralValue.add(
						collateralMarketAddress !== debtMarketAddress
							? parseUnits(exchangeRoute["destAmount"], 0)
							: debtValue,
					),
				),
				Trinity.borrow(morphoMarketAddress, debtMarketAddress, debtValue),
				Trinity.transfer(debtToken.address, FLASHLOAN, debtValue),
			].filter((i) => i !== ""),
			argPosForMulticall,
		);

		if (actionsCallData.length != argPosForMulticall.length)
			throw new Error("Wrong argPosForMulticall");

		const calldata = Trinity.executeFlashloan(
			[debtToken.address],
			[debtValue],
			actionsCallData,
			false,
		);

		return {
			to: NEO,
			data: calldata,
		};
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
		max: boolean,
		argPosForMulticall: number[],
	): Promise<ActionsData> {
		const flashloanAmount = paybackValue.add(paybackValue.div(100));
		const paraswapRoute =
			paybackMarketAddress !== withdrawMarketAddress
				? await getParaswapBuyPrices(
					withdrawToken,
					paybackToken,
					formatUnits(paybackValue, 0),
				)
				: {};
		const paraswapCalldata =
			paybackMarketAddress !== withdrawMarketAddress
				? await buildParaswapBuyData(
					withdrawToken,
					paybackToken,
					formatUnits(paybackValue, 0),
					paraswapRoute,
					slippage,
					smartWallet,
				)
				: "";

		const actionsCallData = Trinity.multicallFlashloan(
			smartWallet,
			txDeadline,
			[
				Trinity.repay(
					morphoMarketAddress,
					paybackMarketAddress,
					smartWallet,
					max ? ethers.constants.MaxUint256 : paybackValue,
				),
				Trinity.withdraw(
					morphoMarketAddress,
					withdrawMarketAddress,
					max ? ethers.constants.MaxUint256 : withdrawValue,
				),
				paybackMarketAddress !== withdrawMarketAddress
					? Trinity.exchange(
						ZERO_EX_ROUTER,
						withdrawToken.address,
						paybackToken.address,
						ethers.constants.MaxUint256,
						paraswapCalldata,
					)
					: "",
				Trinity.transfer(paybackToken.address, FLASHLOAN, flashloanAmount),
			].filter((i) => i !== ""),
			argPosForMulticall,
		);

		if (actionsCallData.length != argPosForMulticall.length)
			throw new Error("Wrong argPosForMulticall");

		const calldata = toWallet
			? Trinity.executeFlashloanWithReceiver(
				[withdrawToken.address],
				[paybackToken.address],
				[flashloanAmount],
				actionsCallData,
				address,
				false,
			)
			: Trinity.executeFlashloan(
				[paybackToken.address],
				[flashloanAmount],
				actionsCallData,
				false,
			);

		return {
			to: NEO,
			data: calldata,
		};
	}
}
