'use client';

import { useState } from "react";
import {
  createThirdwebClient,
  toWei,
  NATIVE_TOKEN_ADDRESS,
  Bridge,
  sendTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

// Mainnet constants for $50 PYUSD payment
const PYUSD_TOKEN_ADDRESS = "0x6c3ea9036406852006290770bedfcaba0e23a0e8"; // PYUSD on Ethereum
const PYUSD_DECIMALS = 6;

// Different target amount
const TARGET_AMOUNT = "20"; // Change from "50" to "10" for $10 instead of $50

// Different target token (e.g., USDC instead of PYUSD)
const USDC_ADDRESS = "0xA0b86a33E6441E1a422c892C8AABef85e7B0ab1e";
const USDC_DECIMALS = 6;

// Different source/destination chains
const BASE_CHAIN_ID = 8453;
const POLYGON_CHAIN_ID = 137;
const ETHEREUM_CHAIN_ID = 1;

// Use these in your configuration:
const TARGET_TOKEN_ADDRESS = USDC_ADDRESS // or USDC_ADDRESS PYUSD_TOKEN_ADDRESS;
const TARGET_DECIMALS = USDC_DECIMALS; // or USDC_DECIMALS PYUSD_DECIMALS
const SOURCE_CHAIN_ID = ETHEREUM_CHAIN_ID; // or BASE_CHAIN_ID, POLYGON_CHAIN_ID
const DESTINATION_CHAIN_ID = ETHEREUM_CHAIN_ID;

const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

interface BridgeStep {
  transactions: any[];
  action?: string;
}

interface BridgeQuote {
  steps: BridgeStep[];
  [key: string]: any;
}

export default function UniversalBridge() {
  const activeAccount = useActiveAccount();
  const [status, setStatus] = useState("");
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);

  async function handleUniversalBridge() {
    if (!activeAccount) {
      setStatus("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setStatus("Preparing route/quote...");
    setQuote(null);

    try {
      // Convert $50 to base units (PYUSD has 6 decimals)
      const fiftyPyusdBaseUnits = toWei(TARGET_AMOUNT, TARGET_DECIMALS);

      console.log("🔄 Preparing bridge quote for $50 PYUSD...");

      // Build the Bridge quote: from any supported asset (any chain) to PYUSD on Ethereum
      const quoteResult = await Bridge.Buy.prepare({
        originChainId: ETHEREUM_CHAIN_ID, // Can be changed to let user pick source chain
        originTokenAddress: NATIVE_TOKEN_ADDRESS, // Using ETH as origin, can be customized
        destinationChainId: ETHEREUM_CHAIN_ID,
        destinationTokenAddress: PYUSD_TOKEN_ADDRESS,
        amount: fiftyPyusdBaseUnits,
        sender: activeAccount.address,
        receiver: activeAccount.address,
        client,
      });

      setQuote(quoteResult);
      setStatus("Quote prepared! Ready to execute bridge transaction.");
      console.log("✅ Bridge quote prepared:", quoteResult);

    } catch (e: any) {
      console.error("❌ Bridge quote failed:", e);
      setStatus("Error preparing quote: " + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  }

  async function executeBridge() {
    if (!quote || !activeAccount) {
      setStatus("No quote available or wallet not connected.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Executing bridge steps...");

      // Execute all steps in the bridge route
      for (let stepIndex = 0; stepIndex < quote.steps.length; stepIndex++) {
        const step = quote.steps[stepIndex];
        console.log(`🔄 Executing step ${stepIndex + 1}/${quote.steps.length}`);
        
        for (let txIndex = 0; txIndex < step.transactions.length; txIndex++) {
          const tx = step.transactions[txIndex];
          const actionText = tx.action || `Step ${stepIndex + 1}, Transaction ${txIndex + 1}`;
          
          setStatus(`Executing: ${actionText}`);
          console.log("🔄 Executing transaction:", actionText);

          await sendTransaction({
            transaction: tx,
            account: activeAccount,
          });

          console.log("✅ Transaction completed:", actionText);
        }
      }

      setStatus("🎉 Universal bridge complete! $50 PYUSD should arrive on Ethereum.");
      console.log("✅ All bridge steps completed successfully!");

    } catch (e: any) {
      console.error("❌ Bridge execution failed:", e);
      setStatus("Error executing bridge: " + (e?.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusColor = () => {
    if (status.includes("Error")) return "text-red-600";
    if (status.includes("complete") || status.includes("🎉")) return "text-green-600";
    if (isLoading) return "text-blue-600";
    return "text-gray-700";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🌉 Universal Bridge
        </h2>
        <p className="text-gray-600">
          Pay $50 PYUSD using any tokens in your wallet
        </p>
      </div>

      {!activeAccount ? (
        <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            Connect your Unicorn wallet above to use Universal Bridge
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bridge Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleUniversalBridge}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading && !quote ? "Preparing Quote..." : "Get Bridge Quote"}
            </button>

            {quote && (
              <button
                onClick={executeBridge}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isLoading ? "Executing Bridge..." : "Execute Bridge ($50 PYUSD)"}
              </button>
            )}
          </div>

          {/* Status Display */}
          {status && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className={`font-medium ${getStatusColor()}`}>
                Status: {status}
              </p>
            </div>
          )}

          {/* Quote Details */}
          {quote && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                onClick={() => setShowQuoteDetails(!showQuoteDetails)}
              >
                <h3 className="font-semibold text-gray-800">Bridge Quote Details</h3>
                <span className="text-gray-500">
                  {showQuoteDetails ? "▼" : "▶"}
                </span>
              </div>
              
              {showQuoteDetails && (
                <div className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-600">Steps:</span>
                        <span className="ml-2">{quote.steps.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Target:</span>
                        <span className="ml-2">$50 PYUSD</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="font-medium text-gray-600">Bridge Steps:</span>
                      <ul className="mt-2 space-y-1">
                        {quote.steps.map((step, index) => (
                          <li key={index} className="text-gray-700">
                            • Step {index + 1}: {step.transactions.length} transaction(s)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                      Raw Quote Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(quote, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Uses any tokens in your wallet as payment source</li>
              <li>• Automatically finds the best route to get $50 PYUSD</li>
              <li>• Handles swaps, bridges, and approvals automatically</li>
              <li>• Final $50 PYUSD arrives on Ethereum mainnet</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Mainnet Transaction:</strong> This will use real tokens and incur real costs. 
              Make sure you understand the quote before executing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}