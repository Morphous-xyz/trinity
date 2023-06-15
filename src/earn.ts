// TODO : Leveraged DAI position
// TODO : Leveraged AAVE V3 stETH position

import { BigNumber, BytesLike, ethers } from "ethers";
import { WETH, aWETH, MORPHO_AAVE, aSTETH, FLASHLOAN, ZERO_EX_ROUTER } from "./constants";
import { Trinity } from "trinity";
import { Actions } from "actions";
import { ActionsData } from "types";
import { buildExchangeData } from "index";
import { stETH } from "utils/constants";
import { formatUnits, parseUnits } from "ethers/lib/utils";

// --- Class used for building tx calldatas for strategies (Earn)
/// - Using Actions
/// - Using Trinity
export abstract class Earn {
	////////////////////////////////////////////////////////////////
	/// --- stETH-ETH - Aave V2
	///////////////////////////////////////////////////////////////

	// TODO : Parsing with token decimals (18) + viem types
	public static stETH_ETH_Leverage_AaveV2(
		inputWrapped: boolean,
		smartWallet: string,
		txDeadline: number,
		amount: BigNumber,
	): BytesLike {
		const flashloanValue = amount.mul(2);
		const totalValue = amount.mul(3);

		const actionsCallData = Trinity.multicallFlashloan(
			smartWallet,
			txDeadline,
			[
				inputWrapped ? Trinity.transferFrom(WETH, smartWallet, amount) : "", // Transfer WETH to smartWallet if from account
				Trinity.withdrawWETH(inputWrapped ? totalValue : flashloanValue),
				Trinity.depositSTETH(totalValue), // Receiving aSTETH
				Trinity.supply(MORPHO_AAVE, aSTETH, smartWallet, totalValue), // Supply aSTETH to AaveV2
				Trinity.borrow(MORPHO_AAVE, aWETH, flashloanValue), // Borrow aWETH from AaveV2
				Trinity.transfer(WETH, FLASHLOAN, flashloanValue), // Repay flashloan
			],
			[0, 0, 0, 0, 0, 0],
		);

		// Flashloan WETH and executing actions
		return Trinity.executeFlashloan(
			[WETH],
			[flashloanValue],
			actionsCallData,
			false,
		);
	}

	public static async stETH_ETH_Deleverage_AaveV2(
		from: string,
		toWallet: boolean,
		txDeadline: number,
		totalSupplied: BigNumber,
		totalBorrowed: BigNumber,
		slippage: number,
		address: string,
		smartWallet: string,
	): Promise<BytesLike> {
		const exchangeCalldata = await buildExchangeData(
			ZERO_EX_ROUTER,
			{ address: stETH, name: "stETH", symbol: "stETH", decimals: 18 },
			{ address: WETH, name: "WETH", symbol: "WETH", decimals: 18 },
			formatUnits(totalSupplied, 0),
			slippage,
			smartWallet,
			true,
		);
		
		const actionsCallData = Trinity.multicallFlashloan(
			toWallet ? address : smartWallet,
			txDeadline,
			[
				Trinity.repay(MORPHO_AAVE, aWETH, from, ethers.constants.MaxUint256),
				Trinity.withdraw(MORPHO_AAVE, aSTETH, ethers.constants.MaxUint256),
				Trinity.exchange(
					ZERO_EX_ROUTER,
					aWETH,
					WETH,
					totalBorrowed,
					exchangeCalldata
				),
				Trinity.transfer(WETH, FLASHLOAN, totalBorrowed),
			],
			[0, 0, 0, 0],
		);

		return Trinity.executeFlashloanWithReceiver(
			[aWETH],
			[aWETH],
			[totalBorrowed],
			actionsCallData,
			toWallet ? address : smartWallet,
			false
		);
	}
}
