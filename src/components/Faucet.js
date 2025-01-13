import React, { useState, useEffect } from "react";
import { Wallet, parseEther, isAddress, formatEther } from "ethers";
import { getProvider } from "../utils/connect";
import FaucetTransactions from "../components/FaucetTransactions";

const Faucet = () => {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [faucetBalance, setFaucetBalance] = useState("N/A");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const lastClaimTime = localStorage.getItem(`lastClaim_${address}`);
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000;

    if (lastClaimTime && currentTime - lastClaimTime < cooldownPeriod) {
      setCooldownActive(true);
      setRemainingTime(
        Math.ceil(
          (cooldownPeriod - (currentTime - lastClaimTime)) / (60 * 60 * 1000)
        )
      );
    } else {
      setCooldownActive(false);
    }
  }, [address]);

  // Fetch Faucet Balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const provider = getProvider();
        const faucetAddress = "0xc5ae0c80057661FfE0c28544F5Fa27328f92fFf2";
        const balance = await provider.getBalance(faucetAddress);
        setFaucetBalance(formatEther(balance));
      } catch (error) {
        console.error("Error fetching faucet balance:", error);
        setFaucetBalance("N/A");
      }
    };

    fetchBalance();
  }, []);

  const sendEth = async () => {
    if (!isAddress(address)) {
      setMessage("Invalid Ethereum address");
      return;
    }

    const lastClaimTime = localStorage.getItem(`lastClaim_${address}`);
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000;

    if (lastClaimTime && currentTime - lastClaimTime < cooldownPeriod) {
      const remainingTime = Math.ceil(
        (cooldownPeriod - (currentTime - lastClaimTime)) / (60 * 60 * 1000)
      );
      setMessage(
        `Cooldown active. Please wait ${remainingTime} hour(s) before claiming again.`
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const provider = getProvider();
      const privateKey = process.env.REACT_APP_PRIVATE_KEY;
      const wallet = new Wallet(privateKey, provider);

      const tx = await wallet.sendTransaction({
        to: address,
        value: parseEther("0.001"),
      });

      localStorage.setItem(`lastClaim_${address}`, currentTime);
      setCooldownActive(true);
      setRemainingTime(24);

      setMessage(`Transaction sent! Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      } relative px-4 sm:px-8 lg:px-16`}
    >
      <div className="absolute top-4 right-4 flex items-center text-gray-400 text-xs space-x-2">
        <div className="flex items-center text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          <span>
            Status: Live, with{" "}
            {faucetBalance !== "N/A"
              ? `${parseFloat(faucetBalance).toFixed(2)} ETH`
              : "N/A"}
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="relative w-10 h-4 bg-gray-300 rounded-full p-1 flex items-center transition-colors duration-300"
        >
          <div
            className={`absolute top-0 left-0 w-4 h-4 rounded-full transition-all duration-300 transform ${
              theme === "dark"
                ? "translate-x-6 bg-yellow-400"
                : "translate-x-0 bg-gray-800"
            }`}
          ></div>
        </button>
        <span className="text-xs">Toggle Theme</span> {/* Theme toggle label */}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center">
        <img src="/base-logo.svg" alt="Base Logo" className="w-12 h-12 mr-3" />
        Base Sepolia ETH Faucet
      </h1>
      <p className="text-base sm:text-sm mb-8 text-center sm:text-left">
        The Base Sepolia Faucet is your go-to source for testnet ETH on Base,
        offering a fast, reliable, and login-free experience on the Base Sepolia
        network.
      </p>
      <div className="w-full max-w-md mb-8">
        <input
          type="text"
          placeholder="Enter your Ethereum address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`w-full p-4 mb-6 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800 text-white"
              : "border-gray-300 bg-white text-black"
          } placeholder-gray-400`}
          disabled={cooldownActive}
        />
        <button
          onClick={sendEth}
          className={`w-full p-4 rounded-lg ${
            cooldownActive
              ? "bg-gray-600 cursor-not-allowed"
              : theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 transition"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
          disabled={loading || cooldownActive}
        >
          {cooldownActive ? (
            `Please wait ${remainingTime} hour(s)`
          ) : loading ? (
            "Sending..."
          ) : (
            <span className="text-white">Send 0.001 ETH (Instant) ⚡️</span>
          )}
        </button>
      </div>
      {message && <p className="mt-6 text-lg text-center">{message}</p>}

      <FaucetTransactions theme={theme} />

      <footer
        className={`absolute bottom-4 w-full text-center text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-800"
        }`}
      >
        Built with <span className="text-blue-500">❤️</span> from India 🇮🇳 by{" "}
        <a
          href="https://x.com/99promitsaha"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          99promitsaha
        </a>
        <br />
        <br />
        <span className="text-xs">
          Disclaimer: This faucet is not associated with Base or Coinbase. It is
          independently developed and maintained.
        </span>
        <br />
        <span className="text-xs">
          Faucet address:{" "}
          <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>
            0xc5ae0c80057661FfE0c28544F5Fa27328f92fFf2
          </span>
        </span>
      </footer>
    </div>
  );
};

export default Faucet;
