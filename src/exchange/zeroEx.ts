import axios from "axios";
import fetch from 'node-fetch';

//import { formatUnits, parseUnits } from "ethers/lib/utils";
import { Token } from "../types";

import { ZERO_EX_API_URL } from "../constants";


interface ApiResponse {
    chainId: number;
    price: string;
    guaranteedPrice: string;
    estimatedPriceImpact: string;
    to: string;
    data: string;
}


export async function getZeroExPrices(
    tokenIn: Token,
    tokenOut: Token,
    amount: string,
) {
    const queryParams = {
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        sellAmount: amount,
        slippagePercentage: "0.05",
        enableSlippageProtection: "true"
    };

    const searchString = new URLSearchParams(queryParams);

    const pricesURL = `${ZERO_EX_API_URL}/swap/v1/price/?${searchString}`;

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

export async function buildZeroExData(
    tokenIn: Token,
    tokenOut: Token,
    amount: string,
) {
    
    const queryParams = {
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        sellAmount: amount,
        excludedSources: "Balancer",
    };


    const searchString = new URLSearchParams(queryParams);

    const pricesURL = `${ZERO_EX_API_URL}/swap/v1/quote/?${searchString}`;

    try {
        const response = await fetch(pricesURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json() as ApiResponse;
        return jsonResponse.data;  // Here we return only the data field of the response
    } catch (error) {
        console.error(`Fetch request failed: ${error.message}`);
        return {}
    }

}