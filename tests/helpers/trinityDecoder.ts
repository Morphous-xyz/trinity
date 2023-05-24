import { Hex, Address, decodeAbiParameters, parseAbiParameters } from "viem";

import { Trinity } from "trinity";

export function decodeSupplyWithoutMaxGas(supplyData: Hex): [Address, Address, Hex, Hex] {
    const decodedData = decodeAbiParameters(
        parseAbiParameters('bytes1, bytes'),
        supplyData
    );

    const [moduleId, functionCalldata] = decodedData;

    const callData = Trinity.morpho_module_interface.decodeFunctionData("supply(address,address,address,uint256)",functionCalldata); 

    const [market, poolToken, onBehalf, amount] = callData;

    return [market, poolToken, onBehalf, amount];
}