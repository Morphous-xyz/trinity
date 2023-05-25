import * as dotenv from "dotenv";
dotenv.config();

if (process.env.VITE_ANVIL_FORK_URL === undefined) {
    throw new Error('Missing environment variable "VITE_ANVIL_FORK_URL"');
  }
  
  export const FORK_URL = process.env.VITE_ANVIL_FORK_URL;
  
  if (process.env.VITE_ANVIL_FORK_BLOCK_NUMBER === undefined) {
    throw new Error('Missing environment variable "VITE_ANVIL_FORK_BLOCK_NUMBER"');
  }
  
  export const FORK_BLOCK_NUMBER = BigInt(Number(process.env.VITE_ANVIL_FORK_BLOCK_NUMBER));


  export const PROXY_TEST_ADDRESS = "0x39a4171253F21c211Df595158a320B6E509A6984";

export const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const WETH_AAVE = "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e";
