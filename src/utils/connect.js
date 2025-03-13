import { JsonRpcProvider } from 'ethers';

const BASE_SEPOLIA_RPC_URL = process.env.REACT_APP_BASE_SEPOLIA_RPC_URL;

export const getProvider = () => {
  return new JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
};