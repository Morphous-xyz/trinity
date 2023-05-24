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