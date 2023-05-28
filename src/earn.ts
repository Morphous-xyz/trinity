// TODO : Leveraged DAI position
// TODO : Leveraged AAVE V3 stETH position

import { BigNumber, BytesLike } from "ethers";
import { WETH, aWETH, MORPHO_AAVE, aSTETH, FLASHLOAN, ZERO_EX_ROUTER } from "./constants";
import { Trinity } from "trinity";
import { Actions } from "actions";
import { ActionsData } from "types";

// --- Class used for building tx calldatas for strategies (Earn)
/// - Using Actions 
/// - Using Trinity
export abstract class Earn {


    ////////////////////////////////////////////////////////////////
    /// --- stETH-ETH - Aave V2
    ///////////////////////////////////////////////////////////////

    // TODO : Parsing with token decimals (18) + viem types

    public static stETH_ETH_Leverage_AaveV2(inputWrapped: boolean, smartWallet: string, txDeadline: number, amount: BigNumber): BytesLike {

        const flashloanValue = amount.mul(2)
        const totalValue = amount.mul(3)

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
            [0, 0, 0, 0, 0, 0] // TODO : good argPos
        )

        // Flashloan WETH and executing actions
        return Trinity.executeFlashloan(
            [WETH],
            [flashloanValue],
            actionsCallData,
            false,
        )
    }


    public static async stETH_ETH_Deleverage_AaveV2(from: string, toWallet: boolean, txDeadline: number, paybackValue: BigNumber, withdrawValue: BigNumber, slippage: number, smartWallet?: string): ActionsData {
      return await Actions.deleverage(
            MORPHO_AAVE,
            txDeadline,
            toWallet,
            aWETH,
            aSTETH,
            {
                address: WETH,
                name: "",
                symbol: "",
                decimals: 18
            },
            {
                address: WETH,
                name: "",
                symbol: "",
                decimals: 18
            },
            from,
            smartWallet ? smartWallet : "",
            paybackValue,
            withdrawValue,
            slippage,
            false,
            [0, 0, 0, 0, 0, 0]
        )
    }
}