import { Hex, Address, decodeAbiParameters, parseAbiParameters } from "viem";

import { Trinity } from "trinity";


////////////////////////////////////////////////////////////////
/// --- FLASHLOAN
///////////////////////////////////////////////////////////////

export function decodeExecuteFlashloan(data: Hex): [Address[], BigInt[], Hex, Boolean] {
    const callData = Trinity.neo_interface.decodeFunctionData("executeFlashloan(address[],uint256[],bytes,bool)", data);

    const [tokens, amount, _data, isAave] = callData;

    return [tokens, amount, _data, isAave];
}



export function decodeExecuteFlashloanWithReceiver(data: Hex): [Address[], Address[], BigInt[], Hex, Address, Boolean] {
    const callData = Trinity.neo_interface.decodeFunctionData("executeFlashloanWithReceiver(address[],address[],uint256[],bytes,address,bool)", data);

    const [tokensReceivers, tokens, amounts, _data, _receiver, isAave] = callData;

    return [tokensReceivers, tokens, amounts, _data, _receiver, isAave];
}


/* TODO 
export function decodeMulticallFlashloan(data: Hex): [Address, BigInt, Hex[]] {

    const callData = Trinity.interface._abiCoder.decode("tuple(address target, bytes data)[]", data);
}
*/

////////////////////////////////////////////////////////////////
/// --- MULTICALL
///////////////////////////////////////////////////////////////

export function decodeMulticall(data: Hex): [BigInt, Hex[], BigInt[]] {
    const callData = Trinity.interface.decodeFunctionData("multicall(uint256,bytes[],uint256[])", data);

    const [deadline, calls, argPos] = callData;

    return [deadline, calls, argPos];
}

export function decodeMulticallWithReceiver(data: Hex): [Address[], BigInt, Hex[], BigInt[], Address] {
    const callData = Trinity.interface.decodeFunctionData("executeWithReceiver(address[],bytes,address)", data);

    const [tokens, multicallData, receiver] = callData;

    const decodedMulticallData = Trinity.neo_interface.decodeFunctionData("multicall(uint256,bytes[],uint256[])", multicallData);

    const [deadline, calls, argPos] = decodedMulticallData;

    return [tokens, deadline, calls, argPos, receiver];
}


////////////////////////////////////////////////////////////////
/// --- MORPHO SUPPLY/WITHDRAW
///////////////////////////////////////////////////////////////

export function decodeSupplyWithMaxGas(data: Hex): [Hex, Address, Address, Hex, BigInt, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("supply(address,address,address,uint256,uint256)", functionCalldata);

    const [market, poolToken, onBehalf, amount, maxGas] = callData;

    return [moduleId, market, poolToken, onBehalf, amount, maxGas];
}


export function decodeSupplyWithoutMaxGas(data: Hex): [Hex, Address, Address, Hex, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("supply(address,address,address,uint256)", functionCalldata);

    const [market, poolToken, onBehalf, amount] = callData;

    return [moduleId, market, poolToken, onBehalf, amount];
}


export function decodeWithdraw(data: Hex): [Hex, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("withdraw(address,address,uint256)", functionCalldata);

    const [market, poolToken, amount] = callData;

    return [moduleId, market, poolToken, amount];
}

////////////////////////////////////////////////////////////////
/// --- MORPHO BORROW/REPAY
///////////////////////////////////////////////////////////////
export function decodeBorrowWithMaxGas(data: Hex): [Hex, Address, Address, BigInt, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("borrow(address,address,uint256,uint256)", functionCalldata);

    const [market, poolToken, amount, maxGas] = callData;

    return [moduleId, market, poolToken, amount, maxGas];
}

export function decodeBorrowWithoutMaxGas(data: Hex): [Hex, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("borrow(address,address,uint256)", functionCalldata);

    const [market, poolToken, amount] = callData;

    return [moduleId, market, poolToken, amount];
}

export function decodeRepay(data: Hex): [Hex, Address, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("repay(address,address,address,uint256)", functionCalldata);

    const [market, poolToken, onBehalf, amount] = callData;

    return [moduleId, market, poolToken, onBehalf, amount];
}


////////////////////////////////////////////////////////////////
/// --- MORPHO CLAIM REWARDS
///////////////////////////////////////////////////////////////



export function decodeClaim(data: Hex): [Hex, Address, BigInt, Hex] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("claim(address,uint256,bytes32[])", functionCalldata);

    const [account, claimable, proofs] = callData;

    return [moduleId, account, claimable, proofs];
}


export function decodeClaimRewards(data: Hex): [Hex, Address, Address[], Boolean] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("claim(address,address[],bool)", functionCalldata);

    const [market, poolTokens, tradeForMorphoToken] = callData;

    return [moduleId, market, poolTokens, tradeForMorphoToken];
}

////////////////////////////////////////////////////////////////
/// --- TOKENS ACTIONS
///////////////////////////////////////////////////////////////


export function decodeApproveToken(data: Hex): [Hex, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("approveToken(address,address,uint256)", functionCalldata);

    const [token, to, amount] = callData;

    return [moduleId, token, to, amount];
}

export function decodeTransferFrom(data: Hex): [Hex, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("transferFrom(address,address,uint256)", functionCalldata);

    const [token, from, amount] = callData;

    return [moduleId, token, from, amount];
}

export function decodeTransfer(data: Hex): [Hex, Address, Address, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("transfer(address,address,uint256)", functionCalldata);

    const [token, to, amount] = callData;

    return [moduleId, token, to, amount];
}

export function decodeDepositSTETH(data: Hex): [Hex, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("depositSTETH(uint256)", functionCalldata);

    const [amount] = callData;

    return [moduleId, amount];
}

export function decodeDepositWETH(data: Hex): [Hex, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("depositWETH(uint256)", functionCalldata);

    const [amount] = callData;

    return [moduleId, amount];
}

export function decodeWithdrawWETH(data: Hex): [Hex, BigInt] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("withdrawWETH(uint256)", functionCalldata);

    const [amount] = callData;

    return [moduleId, amount];
}


export function decodeBalanceInOf(data: Hex): [Hex, Address, Address] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.token_module_interface.decodeFunctionData("balanceInOf(address,address)", functionCalldata);

    const [market, account] = callData;

    return [moduleId, market, account];
}


////////////////////////////////////////////////////////////////
/// --- AGGREGATOR
///////////////////////////////////////////////////////////////

export function decodeExchange(data: Hex): [Hex, Address, Address, Address, BigInt, Hex] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        data
    );

    const [moduleId] = decodedData;

    const callData = Trinity.aggregators_module_interface.decodeFunctionData("exchange(address,address,address,uint256,bytes)", decodedData[1]);

    const [market, from, to, amount, proofs] = callData;

    return [moduleId, market, from, to, amount, proofs];
}