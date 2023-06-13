import axios from "axios";
import fetch from 'node-fetch';

import { Token } from "../types";

import { ODOS_API_URL } from "../constants";

interface TokenWithAmount extends Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    extensions?: any;
    amount: string;
}

interface ApiResponse {
    blockNumber: number;
    gasEstimate: string;
    gasEstimateValue: string;
    inputTokens: string[];
    outputTokens: string[];
    netOutValue: string;
    outValues: string[];
    transaction: any;
    simulation: any;
}


export async function getOdosPrices(
    tokensIn: TokenWithAmount[],
    tokensOut: Token[],
) {
    const queryParams: any = {
        chainId: 1,
        inputTokens: tokensIn,
        outputToken: tokensOut.map(token => ({ ...token, proportion: "1" }))
    };

    const searchString = new URLSearchParams(queryParams);

    const pricesURL = `${ODOS_API_URL}/sor/quote/?${searchString}`;

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

export async function buildOdosData(
    tokensIn: TokenWithAmount[],
    tokensOut: Token[],) {
    const queryParams: any = {
        chainId: 1,
        inputTokens: tokensIn,
        outputToken: tokensOut.map(token => ({ ...token, proportion: "1" }))
    };

    const searchString = new URLSearchParams(queryParams);

    const pricesURL = `${ODOS_API_URL}/sor/swap/?${searchString}`;

    try {
        const response = await fetch(pricesURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json() as ApiResponse;
        return jsonResponse.transaction.data;  // Here we return only the transaction.data field of the response
    } catch (error) {
        console.error(`Fetch request failed: ${error.message}`);
        return {}
    }

}
