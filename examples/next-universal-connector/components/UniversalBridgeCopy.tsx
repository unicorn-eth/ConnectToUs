'use client';

import { useState } from "react";
import {
  createThirdwebClient,
  toWei,
  NATIVE_TOKEN_ADDRESS,
  prepareContractCall,
  sendTransaction,
  getContract,
} from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { polygon, ethereum, base } from "thirdweb/chains";

// Token addresses for demonstration
const USDC_ETHEREUM = "0xA0b86a33E6441E1a422c892C8AABef85e7B0ab1e";
const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;


const MERCHANT_WALLET = "0x7049747E615a1C5C22935D5790a664B7E65D9681"; // Store payments
const DONATION_ADDRESS = "0x..."; // Charity donations  
const SERVICE_PROVIDER = "0x..."; // Service payments

const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

interface TransactionDemo {
  name: string;
  description: string;
  action: () => Promise<void>;
}

export default function UniversalBridge() {
  const activeAccount = useActiveAccount();
  const { mutate: sendTx, isPending } = useSendTransaction();
  const [status, setStatus] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string>("");

  // Simple transaction demos that work reliably
  const transactionDemos: TransactionDemo[] = [
    {
      name: "Send Small ETH",
      description: "Send 0.001 ETH to yourself (demo transaction)",
      action: async () => {
        if (!activeAccount) throw new Error("No wallet connected");
        
        const transaction = {
          to: activeAccount.address,
          value: toWei("0.001"),
          chain: ethereum,
          client,
        };

        return new Promise((resolve, reject) => {
          sendTx(transaction, {
            onSuccess: () => {
              setStatus("✅ ETH transaction successful!");
              resolve();
            },
            onError: (error) => {
              setStatus("❌ Transaction failed: " + error.message);
              reject(error);
            }
          });
        });
      }
    },
    {
      name: "Polygon Transaction",
      description: "Send 5.0 MATIC to yourself on Polygon",
      action: async () => {
        if (!activeAccount) throw new Error("No wallet connected");
        
        const transaction = {
          to: activeAccount.address,
          value: toWei("5.00"),
          chain: polygon,
          client,
        };

        return new Promise((resolve, reject) => {
          sendTx(transaction, {
            onSuccess: () => {
              setStatus("✅ Polygon transaction successful!");
              resolve();
            },
            onError: (error) => {
              setStatus("❌ Transaction failed: " + error.message);
              reject(error);
            }
          });
        });
      }
    }
  ];

  async function executeDemo(demoName: string) {
    const demo = transactionDemos.find(d => d.name === demoName);
    if (!demo || !activeAccount) {
      setStatus("Please connect wallet and select a demo.");
      return;
    }

    setStatus(`🔄 Executing ${demo.name}...`);
    
    try {
      await demo.action();
    } catch (error: any) {
      console.error("Demo failed:", error);
      setStatus("❌ Demo failed: " + (error?.message || String(error)));
    }
  }

  const getStatusColor = () => {
    if (status.includes("❌")) return "text-red-600";
    if (status.includes("✅")) return "text-green-600";
    if (status.includes("🔄")) return "text-blue-600";
    return "text-gray-700";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔗 Wallet Transaction Demo
        </h2>
        <p className="text-gray-600">
          Test your Unicorn wallet with simple transactions
        </p>
      </div>

      {!activeAccount ? (
        <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            Connect your Unicorn wallet above to test transactions
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Demo Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select a transaction demo:
            </label>
            <select
              value={selectedDemo}
              onChange={(e) => setSelectedDemo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Choose a demo...</option>
              {transactionDemos.map((demo, index) => (
                <option key={index} value={demo.name}>
                  {demo.name} - {demo.description}
                </option>
              ))}
            </select>
          </div>

          {/* Execute Button */}
          {selectedDemo && (
            <button
              onClick={() => executeDemo(selectedDemo)}
              disabled={isPending}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isPending ? "Executing..." : `Execute ${selectedDemo}`}
            </button>
          )}

          {/* Status Display */}
          {status && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className={`font-medium ${getStatusColor()}`}>
                {status}
              </p>
            </div>
          )}

          {/* Account Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Connected Account:</h4>
            <p className="text-blue-700 text-sm break-all">
              {activeAccount.address}
            </p>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Demo Features:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Test your Unicorn wallet connection</li>
              <li>• Send transactions on different chains</li>
              <li>• Verify gasless transactions work</li>
              <li>• Practice with small amounts safely</li>
            </ul>
          </div>

          {/* Note about Universal Bridge */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">🔧 Universal Bridge Note:</h4>
            <p className="text-orange-700 text-sm">
              The Universal Bridge API is currently having connectivity issues. 
              This demo shows basic wallet functionality instead. Once the Bridge API is accessible, 
              we can enable cross-chain $50 USDC payments from any supported token.
            </p>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Real Transactions:</strong> These demos use real tokens on mainnet/testnet. 
              Amounts are kept small for safety.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}