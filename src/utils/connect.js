import { JsonRpcProvider } from 'ethers'; // Correct import for Ethers.js v6

// Load the Base Sepolia RPC URL from the environment variable
const BASE_SEPOLIA_RPC_URL = process.env.REACT_APP_BASE_SEPOLIA_RPC_URL;

// Function to get a provider for Base Sepolia
export const getProvider = () => {
  return new JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
};