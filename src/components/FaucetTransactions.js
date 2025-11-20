import React, { useEffect, useState } from "react";
import { formatEther } from "ethers";

const FAUCET_ADDRESS = "0xc5ae0c80057661FfE0c28544F5Fa27328f92fFf2";
const BASESCAN_API_KEY = process.env.REACT_APP_BASESCAN_API_KEY;

const FaucetTransactions = ({ theme }) => {
  const [transactions, setTransactions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `https://api.etherscan.io/v2/api?chainid=84532&module=account&action=txlist&address=${FAUCET_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BASESCAN_API_KEY}`
        );
        const data = await response.json();

        if (data.status === "1" && data.result.length > 0) {
          const outgoingTxs = data.result
            .filter(
              (tx) => tx.from.toLowerCase() === FAUCET_ADDRESS.toLowerCase()
            )
            .slice(0, 5); // Fetch last 5 transactions
          setTransactions(outgoingTxs);
        } else {
          console.log("No transactions found or API error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Mobile breakpoint
    };

    fetchTransactions();
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const displayedTransactions = isMobile
    ? transactions.slice(0, 1) // Show 1 transactions on mobile
    : transactions;

  return (
    <div className="mt-4">
      <h4
        className={`text-xs mb-2 ${
          theme === "dark" ? "text-gray-400" : "text-gray-800"
        }`}
      >
        Last Transaction(s):
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-5xl mx-auto">
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((tx) => (
            <div
              key={tx.hash}
              className={`p-4 rounded-lg shadow ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-800"
              }`}
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
          <p
            className={`text-xs col-span-full ${
              theme === "dark" ? "text-gray-500" : "text-gray-700"
            }`}
          >
            No transactions yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FaucetTransactions;
