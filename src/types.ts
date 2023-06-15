import { BigNumber, BytesLike } from "ethers";

export type ActionsData = {
	to: string;
	data: BytesLike;
	etherValue?: BigNumber;
};

export type Token = {
    [x: string]: any;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	extensions?: any;
};
