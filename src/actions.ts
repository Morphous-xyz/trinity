import { BigNumber } from "@ethersproject/bignumber";
import { ZERO_EX_ROUTER, FLASHLOAN, MORPHEUS, NEO } from "./constants";
import { Trinity } from "./trinity";
import { ethers } from "ethers";
import { ActionsData, Token } from "./types";
import {
	buildExchangeData, /*, getPrices */
	getPrices
} from "./exchange";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import {
	buildParaswapBuyData,
	getParaswapBuyPrices,
} from "./exchange/paraswap";
import { WETH, WSTETH } from "utils/constants";

/// --- Class used for building tx calldatas
/// - Using Trinity
export abstract class Actions {
	////////////////////////////////////////////////////////////////
	/// --- SIMPLE ACTIONS
	///////////////////////////////////////////////////////////////

	public static depositV2(
		morphoMarketAddress: string,
		txDeadline: number,
		fromWallet: boolean,
		marketAddress: string,
		token: Token,
		address: string,
		smartWallet: string,
		value: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet ? Trinity.transferFrom(token.address, address, value) : "",

				Trinity.supply(morphoMarketAddress, marketAddress, smartWallet, value),
			].filter((i) => i !== ""),
			fromWallet ? [0, 0] : [0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}


	public static depositV3(
		underlying: string,
		txDeadline: number,
		fromWallet: boolean,
		token: Token,
		address: string,
		smartWallet: string,
		value: BigNumber,
		maxIterations?: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet ? Trinity.transferFrom(token.address, address, value) : "",
				Trinity.supplyAaveV3(underlying, value, smartWallet, maxIterations ? maxIterations : parseUnits("4"))
			].filter((i) => i !== ""),
			fromWallet ? [0, 0] : [0],
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

	public static withdrawV2(
		morphoMarketAddress: string,
		txDeadline: number,
		toWallet: boolean,
		marketAddress: string,
		tokens: string[],
		address: string,
		value: BigNumber,
		max: boolean,
	): ActionsData {
		const calls = [Trinity.withdraw(
			morphoMarketAddress,
			marketAddress,
			max ? ethers.constants.MaxUint256 : value
		)];

		const calldata = toWallet
			? Trinity.multicallWithReceiver(
				tokens,
				txDeadline,
				calls,
				[0],
				address
			)
			: Trinity.multicall(txDeadline, calls, [0]);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}


	public static withdrawV3(
		underlying: string,
		txDeadline: number,
		toWallet: boolean,
		tokens: string[],
		address: string,
		receiver: string,
		value: BigNumber,
		maxIterations?: BigNumber,
	): ActionsData {
		const calls = [
			Trinity.withdrawAaveV3(
				underlying,
				value,
				address,
				receiver,
				maxIterations ?? parseUnits("4")
			)
		];

		const calldata = toWallet
			? Trinity.multicallWithReceiver(
				tokens,
				txDeadline,
				calls,
				[0],
				receiver
			)
			: Trinity.multicall(txDeadline, calls, [0]);

		return {
			to: MORPHEUS,
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
		argPos?: number
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
			argPos ? [argPos] : [0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}

	////////////////////////////////////////////////////////////////
	/// --- DOUBLE ACTIONS
	///////////////////////////////////////////////////////////////

	public static depositBorrowV2(
		morphoMarketAddress: string,
		txDeadline: number,
		fromWallet: boolean,
		toWallet: boolean,
		supplyMarketAddress: string,
		borrowMarketAddress: string,
		supplyToken: string,
		borrowToken: string,
		address: string,
		smartWallet: string,
		supplyValue: BigNumber,
		borrowValue: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet
					? Trinity.transferFrom(supplyToken, address, supplyValue)
					: "",
				Trinity.supply(
					morphoMarketAddress,
					supplyMarketAddress,
					smartWallet,
					supplyValue,
				),
				Trinity.borrow(morphoMarketAddress, borrowMarketAddress, borrowValue),
				toWallet
					? Trinity.transfer(borrowToken, address, borrowValue)
					: "",
			].filter((i) => i !== ""),
			fromWallet ? [0, 0, 0] : [0, 0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}

	public static depositCollateralBorrowV3(
		txDeadline: number,
		fromWallet: boolean,
		toWallet: boolean,
		supplyToken: string,
		borrowToken: string,
		address: string,
		smartWallet: string,
		supplyValue: BigNumber,
		borrowValue: BigNumber,
		maxIterations?: BigNumber,
	): ActionsData {
		const calldata = Trinity.multicall(
			txDeadline,
			[
				fromWallet
					? Trinity.transferFrom(supplyToken, address, supplyValue)
					: "",
				Trinity.supplyCollateralAaveV3(supplyToken, supplyValue, address),
				Trinity.borrowAaveV3(borrowToken, borrowValue, address, toWallet ? smartWallet : address, maxIterations ? maxIterations : parseUnits("4")),
				toWallet
					? Trinity.transfer(borrowToken, address, borrowValue)
					: "",
			].filter((i) => i !== ""),
			fromWallet ? [0, 0, 0] : [0, 0],
		);

		return {
			to: MORPHEUS,
			data: calldata,
		};
	}

	public static paybackWithdrawV2(
		morphoMarketAddress: string,
		txDeadline: number,
		fromWallet: boolean,
		toWallet: boolean,
		paybackMarketAddress: any,
		withdrawMarketAddress: any,
		paybackToken: string,
		withdrawToken: string,
		address: string,
		smartWallet: string,
		paybackValue: BigNumber,
		withdrawValue: BigNumber,
		maxPayback: boolean,
		maxWithdraw: boolean,
	): ActionsData {
		const calls = [
			fromWallet
				? Trinity.transferFrom(paybackToken, address, paybackValue)
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
				[withdrawToken],
				txDeadline,
				calls,
				fromWallet ? [0, 0, 0] : [0, 0],
				address,
			)
			: Trinity.multicall(txDeadline, calls, fromWallet ? [0, 0, 0] : [0, 0]);

		return {
			to: toWallet ? NEO : MORPHEUS,
			data: calldata,
		};
	}

	public static paybackWithdrawCollateralV3(
		txDeadline: number,
		fromWallet: boolean,
		toWallet: boolean,
		paybackToken: string,
		withdrawToken: string,
		address: string,
		smartWallet: string,
		paybackValue: BigNumber,
		withdrawValue: BigNumber,
		maxPayback: boolean,
		maxWithdraw: boolean,
		//maxIterations?: BigNumber,
	): ActionsData {
		const calls = [
			fromWallet
				? Trinity.transferFrom(paybackToken, address, paybackValue)
				: "",
			Trinity.repayAaveV3(
				paybackToken,
				maxPayback ? ethers.constants.MaxUint256 : paybackValue,
				address,
			),
			Trinity.withdrawCollateralAaveV3(
				withdrawToken,
				maxWithdraw ? ethers.constants.MaxUint256 : withdrawValue,
				address,
				toWallet ? smartWallet : address,
			),
		].filter((i) => i !== "");

		const calldata = toWallet
			? Trinity.multicallWithReceiver(
				[withdrawToken],
				txDeadline,
				calls,
				fromWallet ? [0, 0, 0] : [0, 0],
				address,
			)
			: Trinity.multicall(txDeadline, calls, fromWallet ? [0, 0, 0] : [0, 0]);

		return {
			to: toWallet ? NEO : MORPHEUS,
			data: calldata,
		};
	}

	////////////////////////////////////////////////////////////////
	/// --- LEVERAGE
	///////////////////////////////////////////////////////////////

	public static async leverageV2(
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
	): Promise<ActionsData> {

		let exchangeCalldata: any = "";

		if (collateralMarketAddress !== debtMarketAddress) {
			exchangeCalldata = await buildExchangeData(
				aggregator,
				debtToken,
				collateralToken,
				formatUnits(debtValue, 0),
				slippage,
				smartWallet,
				true,
			);
		}

		let argPos: number[];

		switch (true) {
			case fromWallet && (collateralMarketAddress !== debtMarketAddress):
				argPos = [0, 0, 4, 0, 0]; // .supply[4] = Amount, getted from .exchange
				break;
			case fromWallet:
				argPos = [0, 0, 0, 0];
				break;
			case collateralMarketAddress !== debtMarketAddress:
				argPos = [0, 4, 0, 0];  // .supply[4] = Amount, getted from .exchange
				break;
			default:
				argPos = [0, 0, 0];
				break;
		}


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
					), // TODO : Check if necessary with new argPos structure
				),
				Trinity.borrow(morphoMarketAddress, debtMarketAddress, debtValue),
				Trinity.transfer(debtToken.address, FLASHLOAN, debtValue),
			].filter((i) => i !== ""),
			argPos,
		);

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

	public static async deleverageV2(
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
		aggregator: string,
		max: boolean,
	): Promise<ActionsData> {
		const flashloanAmount = paybackValue.add(paybackValue.div(100));

		let exchangeCalldata: any = "";

		if (paybackMarketAddress !== withdrawMarketAddress) {
			exchangeCalldata = await buildExchangeData(
				aggregator,
				withdrawToken,
				paybackToken,
				formatUnits(paybackValue, 0),
				slippage,
				smartWallet,
				true,
			);
		}

		const argPos = new Array(paybackToken.address !== withdrawToken.address ? 4 : 3).fill(0);


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
						exchangeCalldata,
					)
					: "",
				Trinity.transfer(paybackToken.address, FLASHLOAN, flashloanAmount),
			].filter((i) => i !== ""),
			argPos,
		);

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


	/*
	public static async leverageV3(
		txDeadline: number,
		fromWallet: boolean,
		collateralToken: Token,
		debtToken: Token,
		address: string,
		smartWallet: string,
		collateralValue: BigNumber,
		debtValue: BigNumber,
		aggregator: string,
		slippage: number,
	): Promise<ActionsData> {

		let exchangeCalldata: any = "";

		if (collateralToken.address !== debtToken.address) {
			exchangeCalldata = await buildExchangeData(
				aggregator,
				debtToken,
				collateralToken,
				formatUnits(debtValue, 0),
				slippage,
				smartWallet,
				true,
			);
		}

		const argPos = new Array(fromWallet ? 4 : (collateralToken.address !== debtToken.address ? 4 : 3)).fill(0);

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
				collateralToken.address !== debtToken.address
					? Trinity.exchange(
						aggregator,
						debtToken.address,
						collateralToken.address,
						debtValue,
						exchangeCalldata,
					)
					: "",
				Trinity.supplyCollateralAaveV3(collateralToken.address, collateralValue.add(debtValue), address),
				Trinity.borrowAaveV3(debtToken.address, debtValue, address, smartWallet, parseUnits("4")),
				Trinity.transfer(debtToken.address, FLASHLOAN, debtValue),
			].filter((i) => i !== ""),
			argPos,
		);

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
	*/

	public static async leverageV3(
		txDeadline: number,
		fromWallet: boolean,
		collateralToken: Token,
		debtToken: Token,
		address: string,
		smartWallet: string,
		collateralValue: BigNumber,
		debtValue: BigNumber,
		aggregator: string,
		slippage: number,
	): Promise<ActionsData> {
		let exchangeCalldata: any = "";

		const actions: any[] = [];

		if (fromWallet) {
			actions.push(
				Trinity.transferFrom(
					collateralToken.address,
					address,
					collateralValue,
				),
			);
		}

		if (collateralToken.address === WSTETH) {
			if (debtToken.address !== WETH) {
				exchangeCalldata = await buildExchangeData(
					aggregator,
					debtToken,
					collateralToken,
					formatUnits(debtValue, 0),
					slippage,
					smartWallet,
					true,
				);
				actions.push(
					Trinity.exchange(
						aggregator,
						debtToken.address,
						collateralToken.address,
						debtValue,
						exchangeCalldata,
					),
				);
			}
			actions.push(
				Trinity.withdrawWETH(debtValue),
				Trinity.depositSTETH(collateralValue.add(debtValue)),
				Trinity.wrapstETH(collateralValue.add(debtValue)),
			);
		} else if (collateralToken.address !== debtToken.address) {
			exchangeCalldata = await buildExchangeData(
				aggregator,
				debtToken,
				collateralToken,
				formatUnits(debtValue, 0),
				slippage,
				smartWallet,
				true,
			);
			actions.push(
				Trinity.exchange(
					aggregator,
					debtToken.address,
					collateralToken.address,
					debtValue,
					exchangeCalldata,
				),
			);
		}

		actions.push(
			Trinity.supplyCollateralAaveV3(collateralToken.address, collateralValue.add(debtValue), address),
			Trinity.borrowAaveV3(debtToken.address, debtValue, address, smartWallet, parseUnits("4")),
			Trinity.transfer(debtToken.address, FLASHLOAN, debtValue),
		);


		console.log("actions", actions)

		let argPos: number[];

		if (collateralToken.address === WSTETH) {
			argPos = fromWallet && collateralToken.address !== debtToken.address ? [0, 0, 0, 0, 0, 34, 0, 0] : [0, 0, 0, 0, 34, 0, 0];
		} else if (fromWallet) {
			argPos = collateralToken.address !== debtToken.address ? [0, 0, 0, 0, 0] : [0, 0, 0, 0];
		} else if (collateralToken.address !== debtToken.address) {
			argPos = [0, 0, 0, 0];
		} else {
			argPos = [0, 0, 0];
		}

		const actionsCallData = Trinity.multicallFlashloan(
			smartWallet,
			txDeadline,
			actions,
			argPos,
		);

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


}
