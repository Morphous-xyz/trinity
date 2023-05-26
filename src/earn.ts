// TODO : Put here utils / helpers SDK to do earn operations
// TODO : Leveraged stETH-ETH position
// TODO : Leveraged DAI position

import { BigNumber, BytesLike } from "ethers";
import { WETH, aWETH, MORPHO_AAVE, aSTETH, FLASHLOAN } from "./constants";
import { Trinity } from "trinity";
import { Actions } from "actions";

// --- Class used for building tx calldatas for strategies (Earn)
/// - Using Actions 
/// - Using Trinity
export abstract class Earn {


    ////////////////////////////////////////////////////////////////
    /// --- stETH-ETH - Aave V2
    ///////////////////////////////////////////////////////////////

    // TODO : Parsing with token decimals (18) + viem types

    public static stETH_ETH_Leverage_AaveV2(inputWrapped: boolean, smartWallet: string, txDeadline: number, amount: BigNumber): BytesLike {

        /*
        const callData = Actions.leverage(
            MORPHO_AAVE,
            txDeadline,
            fromWallet,
            aSTETH,
            aWETH,
            WETH,
            WETH,
            smartWallet,
            smartWallet,
            amount,
            flashloanValue,

            */

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
            [0,0,0,0,0,0] // TODO : good argPos
        )

        // Flashloan WETH and executing actions
        return Trinity.executeFlashloan(
            [WETH],
            [flashloanValue],
            actionsCallData,
            false,
        )

    }


    public static stETH_ETH_Deleverage_AaveV2(inputWrapped: boolean, smartWallet: string, txDeadline: number, amount: BigNumber): BytesLike {

        // Flash borrow WETH

        // Repay WETH

        // Withdraw stETH

        // Sell stETH for WETH

        // Pay flashloan

        // Unwrap WETH

        const actionsCallData = 
    }




}