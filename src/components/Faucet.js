import React, { useState, useEffect } from "react";
import { Wallet, parseEther, isAddress } from "ethers";
import { getProvider } from "../utils/connect";

const Faucet = () => {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const lastClaimTime = localStorage.getItem(`lastClaim_${address}`);
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

  const sendEth = async () => {
    if (!isAddress(address)) {
      setMessage("Invalid Ethereum address");
      return;
    }

    // Check cooldown
    const lastClaimTime = localStorage.getItem(`lastClaim_${address}`);
    const currentTime = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
        value: parseEther("0.001"), // Send 0.001 ETH
      });

      // Save the current time as the last claim time for the address
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        <img src="/base-logo.svg" alt="Base Logo" className="w-10 h-10 mr-3" />
        Base Sepolia ETH Faucet
      </h1>
      <p className="text-sm text-gray-400 mb-12">
        This faucet sends 0.001 Base Sepolia ETH. If it runs out, please refill
        or contact me!
        <br />
        <span className="font-mono text-gray-500">
          Faucet address:{" "}
          <span className="text-white">
            0xc5ae0c80057661FfE0c28544F5Fa27328f92fFf2
          </span>
        </span>
      </p>
      <div className="w-full max-w-md mb-8">
        <input
          type="text"
          placeholder="Enter your Ethereum address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-4 mb-6 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-400"
          disabled={cooldownActive}
        />
        <button
          onClick={sendEth}
          className={`w-full p-4 rounded-lg ${
            cooldownActive
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
          disabled={loading || cooldownActive}
        >
          {cooldownActive
            ? `Please wait ${remainingTime} hour(s)`
            : loading
            ? "Sending..."
            : "Send 0.001 ETH (Instant) ⚡️"}
        </button>
      </div>
      {message && <p className="mt-6 text-lg">{message}</p>}
      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-400">
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
        <span className="text-xs text-gray-500">
          Disclaimer: This faucet is not associated with Base or Coinbase. It is
          independently developed and operated by an individual.
        </span>
      </footer>
    </div>
  );
};

export default Faucet;
