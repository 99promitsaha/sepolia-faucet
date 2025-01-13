import React, { useEffect, useState } from "react";
import { formatEther } from "ethers"; // Import formatEther for precise ETH formatting

const FAUCET_ADDRESS = "0xc5ae0c80057661FfE0c28544F5Fa27328f92fFf2";
const BASESCAN_API_KEY = process.env.REACT_APP_BASESCAN_API_KEY;

const FaucetTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch all transactions from Sepolia Basescan API
        const response = await fetch(
          `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${FAUCET_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BASESCAN_API_KEY}`
        );
        const data = await response.json();

        if (data.status === "1" && data.result.length > 0) {
          // Filter outgoing transactions
          const outgoingTxs = data.result
            .filter(
              (tx) => tx.from.toLowerCase() === FAUCET_ADDRESS.toLowerCase()
            )
            .slice(0, 5); // Get the last 5 transactions

          setTransactions(outgoingTxs);
        } else {
          console.log("No transactions found or API error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Helper function to calculate time ago
  const timeAgo = (timestamp) => {
    const now = new Date();
    const txTime = new Date(timestamp * 1000);
    const diffInSeconds = Math.floor((now - txTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="mt-4">
      <h4 className="text-gray-400 text-xs mb-2">Last 5 Transactions:</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-5xl mx-auto">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx.hash}
              className="bg-gray-800 text-gray-300 p-4 rounded-lg shadow"
            >
              <div className="text-sm">
                <strong>To:</strong> <span className="break-all">{tx.to}</span>
              </div>
              <div className="text-sm">
                <strong>Value:</strong> {formatEther(tx.value)} ETH
              </div>
              <div className="text-sm">
                <strong>Hash:</strong>{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                </a>
              </div>
              <div className="text-sm text-gray-500">
                <strong>Time:</strong> {timeAgo(tx.timeStamp)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-xs col-span-full">
            No transactions yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FaucetTransactions;
