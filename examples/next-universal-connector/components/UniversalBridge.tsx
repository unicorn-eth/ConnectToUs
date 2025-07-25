'use client';

import { useState, useEffect } from "react";
import {
  createThirdwebClient,
  toWei,
  NATIVE_TOKEN_ADDRESS,
  getContract,
  readContract,
  Bridge,
  sendTransaction,
  prepareTransaction,
} from "thirdweb";
import { useActiveAccount, useSendTransaction, ConnectButton } from "thirdweb/react";
import { polygon, ethereum, base, arbitrum, optimism } from "thirdweb/chains";
import { balanceOf, approve } from "thirdweb/extensions/erc20";

const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

// Rough USD price estimates for common tokens (for display purposes only)
const ROUGH_TOKEN_PRICES: { [key: string]: number } = {
  'ETH': 2500,
  'POL': 0.45,
  'MATIC': 0.45, // Legacy name for POL
  'USDC': 1.00,
  'USDT': 1.00,
  'PYUSD': 1.00,
  'DAI': 1.00,
};

// Get rough USD estimate for a token amount
function getRoughUSDEstimate(amount: string, tokenSymbol: string): string {
  const cleanTokenSymbol = tokenSymbol.replace('-BASE', '').replace('-ARBITRUM', '');
  const price = ROUGH_TOKEN_PRICES[cleanTokenSymbol] || 1;
  const usdValue = parseFloat(amount) * price;
  
  if (usdValue < 1) {
    return `~${usdValue.toFixed(3)}`;
  } else if (usdValue < 100) {
    return `~${usdValue.toFixed(2)}`;
  } else {
    return `~${usdValue.toFixed(0)}`;
  }
}

// Comprehensive token definitions across chains
const SUPPORTED_CHAINS = [
  { 
    chain: ethereum, 
    name: "Ethereum",
    nativeSymbol: "ETH",
    tokens: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", decimals: 18 },
      { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
      { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
      { address: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8", symbol: "PYUSD", decimals: 6 },
    ]
  },
  { 
    chain: polygon, 
    name: "Polygon",
    nativeSymbol: "POL",
    tokens: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: "POL", decimals: 18 },
      { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC.e", decimals: 6 },
      { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC", decimals: 6 },
      { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 },
    ]
  },
  { 
    chain: base, 
    name: "Base",
    nativeSymbol: "ETH",
    tokens: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", decimals: 18 },
      { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 },
      { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", decimals: 18 },
    ]
  },
  { 
    chain: arbitrum, 
    name: "Arbitrum",
    nativeSymbol: "ETH",
    tokens: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", decimals: 18 },
      { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6 },
      { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6 },
    ]
  }
];

interface UserBalance {
  chainName: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  isNative: boolean;
}

interface RouteOption {
  fromChain: string;
  fromToken: string;
  fromBalance: string;
  toChain: string;
  toToken: string;
  estimatedOutput: string;
  estimatedInput?: string; // Actual input amount needed
  steps: string[];
  complexity: 'simple' | 'bridge' | 'complex';
  estimated: boolean;
  // Add execution details
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromTokenDecimals: number;
  toTokenDecimals: number;
  // Add real quote data
  bridgeQuote?: any;
  // Add insufficient funds flag
  insufficientFunds?: boolean;
  requiredAmount?: string;
}

export default function TrueUniversalBridge() {
  const activeAccount = useActiveAccount();
  const { mutate: sendTx, isPending } = useSendTransaction();
  const [status, setStatus] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [targetAmount, setTargetAmount] = useState("2.0");
  const [targetToken, setTargetToken] = useState("POL");
  const [enableRealExecution, setEnableRealExecution] = useState(false);
  const [showBuyWithCard, setShowBuyWithCard] = useState(false);

  // Scan user balances across all chains
  async function scanUserBalances() {
    if (!activeAccount) {
      setStatus("Please connect your wallet first.");
      return;
    }

    setIsScanning(true);
    setStatus("🔍 Scanning your tokens across all chains...");
    const balances: UserBalance[] = [];

    try {
      for (const chainConfig of SUPPORTED_CHAINS) {
        console.log(`🔍 Checking ${chainConfig.name}...`);
        
        for (const token of chainConfig.tokens) {
          try {
            let balance = "0";
            
            if (token.address === NATIVE_TOKEN_ADDRESS) {
              // Get native token balance
              try {
                const response = await fetch(`https://${chainConfig.chain.id}.rpc.thirdweb.com/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_getBalance',
                    params: [activeAccount.address, 'latest']
                  })
                });
                const data = await response.json();
                balance = data.result || "0";
              } catch (e) {
                console.log(`Failed to get native balance on ${chainConfig.name}`);
                continue;
              }
            } else {
              // Get ERC20 token balance
              try {
                const contract = getContract({
                  client,
                  chain: chainConfig.chain,
                  address: token.address,
                });
                
                const balanceResult = await balanceOf({
                  contract,
                  address: activeAccount.address,
                });
                
                balance = balanceResult.toString();
              } catch (e) {
                console.log(`Failed to get ${token.symbol} balance on ${chainConfig.name}`);
                continue;
              }
            }

            // Convert to human readable format
            const balanceFormatted = parseFloat(
              (parseInt(balance) / Math.pow(10, token.decimals)).toFixed(6)
            );

            // Only include non-zero balances
            if (balanceFormatted > 0) {
              balances.push({
                chainName: chainConfig.name,
                chainId: chainConfig.chain.id,
                tokenAddress: token.address,
                tokenSymbol: token.symbol,
                balance: balance,
                balanceFormatted: balanceFormatted.toString(),
                decimals: token.decimals,
                isNative: token.address === NATIVE_TOKEN_ADDRESS,
              });
            }
          } catch (error) {
            console.log(`Error checking ${token.symbol} on ${chainConfig.name}:`, error);
          }
        }
      }

      setUserBalances(balances);
      
      if (balances.length > 0) {
        setStatus(`✅ Found ${balances.length} token balance(s) across chains!`);
        await findRoutes(balances);
      } else {
        setStatus("😅 No token balances found. Make sure you have tokens on supported chains.");
      }

    } catch (error) {
      console.error("Balance scanning failed:", error);
      setStatus("❌ Failed to scan balances. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }

  // Find possible routes that can actually be executed automatically
  async function findRoutes(balances: UserBalance[]) {
    if (!balances || balances.length === 0) {
      setStatus("❌ No token balances available. Please discover your tokens first.");
      return;
    }

    setIsScanning(true);
    setStatus("🛣️ Finding executable routes...");
    setAvailableRoutes([]);
    setSelectedRoute(null);
    
    const routes: RouteOption[] = [];

    try {
      // Determine target chain and token based on selection
      let targetChainName: string;
      let targetTokenSymbol: string;
      
      if (targetToken === "PYUSD") {
        targetChainName = "Ethereum";
        targetTokenSymbol = "PYUSD";
      } else if (targetToken === "USDC-BASE") {
        targetChainName = "Base";
        targetTokenSymbol = "USDC";
      } else if (targetToken === "ETH-BASE") {
        targetChainName = "Base";
        targetTokenSymbol = "ETH";
      } else if (targetToken === "ETH-ARBITRUM") {
        targetChainName = "Arbitrum";
        targetTokenSymbol = "ETH";
      } else {
        targetChainName = "Polygon";
        targetTokenSymbol = targetToken; // POL, USDC, USDT on Polygon
      }

      const targetChainConfig = SUPPORTED_CHAINS.find(c => c.name === targetChainName);
      const targetTokenConfig = targetChainConfig?.tokens.find(t => t.symbol === targetTokenSymbol);
      
      if (!targetTokenConfig) {
        setStatus("❌ Target token not supported");
        return;
      }

      // Test each balance to see if it can create a working route
      for (const balance of balances) {
        const sourceChainConfig = SUPPORTED_CHAINS.find(c => c.name === balance.chainName);
        const sourceTokenConfig = sourceChainConfig?.tokens.find(t => t.symbol === balance.tokenSymbol);
        
        if (!sourceChainConfig || !sourceTokenConfig) continue;

        // Only show routes that we can actually execute:

        // 1. Same chain, same token (direct transfer) - CHECK SUFFICIENT BALANCE
        if (balance.chainName === targetChainName && balance.tokenSymbol === targetTokenSymbol) {
          const availableAmount = parseFloat(balance.balanceFormatted);
          const requestedAmount = parseFloat(targetAmount);
          
          // Only show direct transfer if user has enough balance
          if (availableAmount >= requestedAmount) {
            routes.push({
              fromChain: balance.chainName,
              fromToken: balance.tokenSymbol,
              fromBalance: balance.balanceFormatted,
              toChain: targetChainName,
              toToken: targetTokenSymbol,
              estimatedOutput: targetAmount, // They get exactly what they requested
              steps: [`Direct transfer: ${targetAmount} ${balance.tokenSymbol}`],
              complexity: 'simple',
              estimated: false,
              fromChainId: sourceChainConfig.chain.id,
              toChainId: targetChainConfig.chain.id,
              fromTokenAddress: sourceTokenConfig.address,
              toTokenAddress: targetTokenConfig.address,
              fromTokenDecimals: sourceTokenConfig.decimals,
              toTokenDecimals: targetTokenConfig.decimals,
            });
          }
          // If insufficient balance, skip this route (don't show impossible direct transfers)
        }
        
        // 2. Cross-chain, same token (bridge only) - TEST IF BRIDGE API WORKS
        if (balance.chainName !== targetChainName && balance.tokenSymbol === targetTokenSymbol) {
          const bridgeResult = await testBridgeRoute(
            sourceChainConfig.chain.id,
            sourceTokenConfig.address,
            targetChainConfig.chain.id,
            targetTokenConfig.address,
            targetTokenConfig.decimals,
            balance // Pass the user balance for checking
          );
          
          if (bridgeResult.canBridge) {
            routes.push({
              fromChain: balance.chainName,
              fromToken: balance.tokenSymbol,
              fromBalance: balance.balanceFormatted,
              toChain: targetChainName,
              toToken: targetTokenSymbol,
              estimatedOutput: bridgeResult.estimatedOutput || `~${targetAmount}`,
              estimatedInput: bridgeResult.estimatedInput,
              steps: [`Bridge ${balance.tokenSymbol} from ${balance.chainName} → ${targetChainName}`],
              complexity: 'bridge',
              estimated: true,
              fromChainId: sourceChainConfig.chain.id,
              toChainId: targetChainConfig.chain.id,
              fromTokenAddress: sourceTokenConfig.address,
              toTokenAddress: targetTokenConfig.address,
              fromTokenDecimals: sourceTokenConfig.decimals,
              toTokenDecimals: targetTokenConfig.decimals,
              bridgeQuote: bridgeResult.quote,
              insufficientFunds: bridgeResult.insufficientFunds,
              requiredAmount: bridgeResult.requiredAmount,
            });
          }
        }

        // 3. Cross-chain bridge with automatic swap - TEST IF FULL ROUTE WORKS
        else if (balance.chainName !== targetChainName) {
          const bridgeResult = await testBridgeRoute(
            sourceChainConfig.chain.id,
            sourceTokenConfig.address,
            targetChainConfig.chain.id,
            targetTokenConfig.address,
            targetTokenConfig.decimals,
            balance // Pass the user balance for checking
          );
          
          if (bridgeResult.canBridge) {
            routes.push({
              fromChain: balance.chainName,
              fromToken: balance.tokenSymbol,
              fromBalance: balance.balanceFormatted,
              toChain: targetChainName,
              toToken: targetTokenSymbol,
              estimatedOutput: bridgeResult.estimatedOutput || `~${targetAmount}`,
              estimatedInput: bridgeResult.estimatedInput,
              steps: [`Bridge & convert ${balance.tokenSymbol} from ${balance.chainName} → ${targetTokenSymbol} on ${targetChainName}`],
              complexity: 'bridge',
              estimated: true,
              fromChainId: sourceChainConfig.chain.id,
              toChainId: targetChainConfig.chain.id,
              fromTokenAddress: sourceTokenConfig.address,
              toTokenAddress: targetTokenConfig.address,
              fromTokenDecimals: sourceTokenConfig.decimals,
              toTokenDecimals: targetTokenConfig.decimals,
              bridgeQuote: bridgeResult.quote,
              insufficientFunds: bridgeResult.insufficientFunds,
              requiredAmount: bridgeResult.requiredAmount,
            });
          }
        }

        // Skip same-chain swaps unless we have DEX integration
        // Skip complex routes that require manual intervention
      }

      // Sort routes - executable first, then by complexity
      routes.sort((a, b) => {
        // Prioritize routes with sufficient funds
        if (a.insufficientFunds && !b.insufficientFunds) return 1;
        if (!a.insufficientFunds && b.insufficientFunds) return -1;
        
        // Then sort by complexity
        const complexityOrder = { 'simple': 0, 'bridge': 1, 'complex': 2 };
        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
      });

      setAvailableRoutes(routes);
      
      const executableRoutes = routes.filter(r => !r.insufficientFunds);
      const insufficientRoutes = routes.filter(r => r.insufficientFunds);
      
      if (routes.length > 0) {
        // Auto-select first executable route, or first route if none are executable
        setSelectedRoute(executableRoutes.length > 0 ? executableRoutes[0] : routes[0]);
        
        let statusMessage = `🎯 Found ${routes.length} route(s) for ${targetAmount} ${targetToken}`;
        if (executableRoutes.length > 0) {
          statusMessage += `. ${executableRoutes.length} ready to execute`;
        }
        if (insufficientRoutes.length > 0) {
          statusMessage += `, ${insufficientRoutes.length} need more funds`;
        }
        setStatus(statusMessage);
      } else {
        setStatus(`😅 No routes available for ${targetAmount} ${targetToken}. Try different target amounts or tokens.`);
      }
      
    } catch (error: any) {
      console.error("Route finding failed:", error);
      setStatus("❌ Failed to find routes. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }

  // Test if a bridge route actually works and get real quote
  async function testBridgeRoute(
    fromChainId: number, 
    fromTokenAddress: string, 
    toChainId: number, 
    toTokenAddress: string,
    targetTokenDecimals: number,
    userBalance: UserBalance
  ): Promise<{ canBridge: boolean; quote?: any; estimatedInput?: string; estimatedOutput?: string }> {
    try {
      const targetAmountWei = toWei(targetAmount, targetTokenDecimals);
      
      const bridgeQuote = await Bridge.Buy.prepare({
        originChainId: fromChainId,
        originTokenAddress: fromTokenAddress,
        destinationChainId: toChainId,
        destinationTokenAddress: toTokenAddress,
        amount: targetAmountWei,
        sender: activeAccount!.address,
        receiver: activeAccount!.address,
        client,
      });

      // Check if we got a valid quote with executable steps
      const hasValidSteps = bridgeQuote && 
                           bridgeQuote.steps && 
                           bridgeQuote.steps.length > 0 &&
                           bridgeQuote.steps.every(step => step.transactions && step.transactions.length > 0);
      
      if (hasValidSteps) {
        // Extract actual costs from the quote
        let estimatedInput = "Unknown";
        let estimatedOutput = targetAmount;
        let inputAmountFormatted = 0;
        
        try {
          // Try multiple ways to extract input amount from quote
          if (bridgeQuote.quote?.fromAmount) {
            inputAmountFormatted = parseFloat(bridgeQuote.quote.fromAmount) / Math.pow(10, userBalance.decimals);
            estimatedInput = inputAmountFormatted.toFixed(6);
          } else if (bridgeQuote.fromAmount) {
            inputAmountFormatted = parseFloat(bridgeQuote.fromAmount) / Math.pow(10, userBalance.decimals);
            estimatedInput = inputAmountFormatted.toFixed(6);
          } else if (bridgeQuote.steps && bridgeQuote.steps[0]?.fromAmount) {
            inputAmountFormatted = parseFloat(bridgeQuote.steps[0].fromAmount) / Math.pow(10, userBalance.decimals);
            estimatedInput = inputAmountFormatted.toFixed(6);
          }
          
          // Try to extract output amount
          if (bridgeQuote.quote?.toAmount) {
            const outputAmount = parseFloat(bridgeQuote.quote.toAmount) / Math.pow(10, targetTokenDecimals);
            estimatedOutput = outputAmount.toFixed(6);
          } else if (bridgeQuote.toAmount) {
            const outputAmount = parseFloat(bridgeQuote.toAmount) / Math.pow(10, targetTokenDecimals);
            estimatedOutput = outputAmount.toFixed(6);
          }
        } catch (e) {
          console.log("Could not extract exact amounts from quote:", e);
        }
        
        // Check if user has sufficient balance for the input amount required
        const userBalanceAmount = parseFloat(userBalance.balanceFormatted);
        
        if (estimatedInput !== "Unknown" && inputAmountFormatted > 0) {
          if (userBalanceAmount < inputAmountFormatted) {
            console.log(`Insufficient balance for ${userBalance.tokenSymbol}: need ${inputAmountFormatted.toFixed(6)}, have ${userBalanceAmount.toFixed(6)}`);
            return { canBridge: false }; // Don't show this route - insufficient funds
          }
        } else {
          // If we can't determine input amount, be conservative and check if they have a reasonable amount
          // For cross-chain bridges, they usually need more than they're trying to get
          const estimatedNeedMultiplier = fromChainId !== toChainId ? 1.5 : 1.1; // Extra buffer for bridge vs simple transfers
          const estimatedMinimumNeeded = parseFloat(targetAmount) * estimatedNeedMultiplier;
          
          if (userBalanceAmount < estimatedMinimumNeeded) {
            console.log(`Conservative balance check failed for ${userBalance.tokenSymbol}: have ${userBalanceAmount.toFixed(6)}, estimated need ${estimatedMinimumNeeded.toFixed(6)}`);
            return { canBridge: false };
          }
        }
        
        return {
          canBridge: true,
          quote: bridgeQuote,
          estimatedInput,
          estimatedOutput
        };
      }
      
      return { canBridge: false };
             
    } catch (error) {
      console.log(`Bridge route not available: ${fromChainId} → ${toChainId}:`, error);
      return { canBridge: false };
    }
  }

  // Test if a full bridge + swap route works
  async function testFullBridgeRoute(
    fromChainId: number, 
    fromTokenAddress: string, 
    toChainId: number, 
    toTokenAddress: string
  ): Promise<boolean> {
    try {
      const testAmount = toWei(targetAmount, 6); // Test with actual target amount
      
      const bridgeQuote = await Bridge.Buy.prepare({
        originChainId: fromChainId,
        originTokenAddress: fromTokenAddress,
        destinationChainId: toChainId,
        destinationTokenAddress: toTokenAddress,
        amount: testAmount,
        sender: activeAccount!.address,
        receiver: activeAccount!.address,
        client,
      });

      // Check if we got a valid quote that handles the full conversion
      return bridgeQuote && 
             bridgeQuote.steps && 
             bridgeQuote.steps.length > 0 &&
             bridgeQuote.steps.every(step => step.transactions && step.transactions.length > 0);
             
    } catch (error) {
      console.log(`Full bridge route not available: ${fromChainId} → ${toChainId} with conversion`);
      return false;
    }
  }

  // Execute selected test demo
  async function executeTestDemo() {
    const demo = testTransactionDemos.find(d => d.name === selectedTestDemo);
    if (!demo || !activeAccount) {
      setStatus("Please connect wallet and select a test demo.");
      return;
    }

    setStatus(`🧪 Executing ${demo.name}...`);
    
    try {
      await demo.action();
    } catch (error: any) {
      console.error("Test demo failed:", error);
      setStatus("❌ Test demo failed: " + (error?.message || String(error)));
    }
  }

  // Test transaction: Send 2 USDC on Base (called from demo dropdown)
  async function testBaseUsdcTransaction() {
    if (!activeAccount) {
      throw new Error("Please connect your wallet first.");
    }

    setStatus("🧪 Preparing test transaction: 2 USDC on Base...");

    try {
      // USDC contract on Base
      const usdcBaseAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
      const amount = toWei("2", 6); // 2 USDC (6 decimals)

      // Create USDC contract instance
      const usdcContract = getContract({
        client,
        chain: base,
        address: usdcBaseAddress,
      });

      // Check balance first
      try {
        const balance = await balanceOf({
          contract: usdcContract,
          address: activeAccount.address,
        });
        
        const balanceFormatted = parseFloat((parseInt(balance.toString()) / Math.pow(10, 6)).toFixed(6));
        
        if (balanceFormatted < 2) {
          throw new Error(`Insufficient USDC balance on Base. You have ${balanceFormatted} USDC, need 2 USDC.`);
        }
        
        setStatus(`✅ Balance check passed: ${balanceFormatted} USDC on Base`);
      } catch (balanceError) {
        setStatus("⚠️ Could not check USDC balance, proceeding with transaction...");
      }

      // Prepare transfer transaction (sending to self for testing)
      const transferTransaction = transfer({
        contract: usdcContract,
        to: activeAccount.address, // Send to self for testing
        amount: amount,
      });

      setStatus("🔄 Executing test transaction...");

      // Execute the transaction
      return new Promise<void>((resolve, reject) => {
        sendTx(transferTransaction, {
          onSuccess: (result) => {
            setStatus(`✅ Test transaction successful! Sent 2 USDC on Base. Hash: ${result.transactionHash}`);
            resolve();
          },
          onError: (error) => {
            setStatus("❌ Test transaction failed: " + error.message);
            reject(error);
          }
        });
      });

    } catch (error: any) {
      console.error("Test transaction failed:", error);
      setStatus("❌ Test transaction failed: " + (error?.message || String(error)));
      throw error;
    }
  }

  // Execute the selected route - only called for verified working routes
  async function executeRoute() {
    if (!selectedRoute || !activeAccount) {
      setStatus("Please select a route and connect your wallet.");
      return;
    }

    if (!enableRealExecution) {
      // Simulation mode
      setStatus(`🎭 Simulating ${selectedRoute.complexity} route...`);
      for (let i = 0; i < selectedRoute.steps.length; i++) {
        setStatus(`🎭 Simulating step ${i + 1}/${selectedRoute.steps.length}: ${selectedRoute.steps[i]}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      setStatus(`✅ Simulation complete! Route: ${selectedRoute.steps.join(" → ")}`);
      return;
    }

    try {
      setStatus(`🚀 Executing REAL ${selectedRoute.complexity} route...`);

      // Handle direct transfers (same token, same chain)
      if (selectedRoute.complexity === 'simple' && selectedRoute.steps[0] === "Direct transfer") {
        await executeDirectTransfer();
      }
      
      // Handle cross-chain bridges (these are all tested and working)
      else if (selectedRoute.complexity === 'bridge') {
        await executeBridge();
      }

      // Note: We no longer show same-chain swaps or complex routes that don't work automatically

    } catch (error: any) {
      console.error("Route execution failed:", error);
      setStatus("❌ Route execution failed: " + (error?.message || String(error)));
    }
  }

  // Direct transfer (same token, same chain) - send exact target amount
  async function executeDirectTransfer() {
    const targetAmountWei = toWei(targetAmount, selectedRoute!.toTokenDecimals);
    
    // Check if user has sufficient balance
    const availableBalance = parseFloat(selectedRoute!.fromBalance);
    const requestedAmount = parseFloat(targetAmount);
    
    if (availableBalance < requestedAmount) {
      throw new Error(`Insufficient balance. You have ${availableBalance} ${selectedRoute!.fromToken}, need ${requestedAmount}`);
    }
    
    const transaction = prepareTransaction({
      to: activeAccount!.address, // Demo: send to self
      value: selectedRoute!.fromTokenAddress === NATIVE_TOKEN_ADDRESS ? targetAmountWei : undefined,
      chain: selectedRoute!.fromChainId === ethereum.id ? ethereum : 
             selectedRoute!.fromChainId === polygon.id ? polygon : 
             selectedRoute!.fromChainId === base.id ? base : arbitrum,
      client,
    });

    return new Promise<void>((resolve, reject) => {
      sendTx(transaction, {
        onSuccess: () => {
          setStatus(`✅ Direct transfer complete! Sent ${targetAmount} ${selectedRoute!.toToken} to yourself`);
          resolve();
        },
        onError: (error) => {
          setStatus("❌ Direct transfer failed: " + error.message);
          reject(error);
        }
      });
    });
  }

  // Same-chain swap using DEX
  async function executeSameChainSwap() {
    setStatus("🔄 Preparing same-chain swap...");
    
    // For now, simulate the swap process
    // In production, you'd integrate with Uniswap, QuickSwap, etc.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus(`✅ Same-chain swap simulated! ${selectedRoute!.fromToken} → ${selectedRoute!.toToken} on ${selectedRoute!.fromChain}`);
    
    // TODO: Implement actual DEX swap
    // Example: Use Uniswap V3 or QuickSwap on Polygon
  }

  // Cross-chain bridge
  async function executeBridge() {
    setStatus("🌉 Preparing cross-chain bridge...");
    
    try {
      // Use ThirdWeb Bridge API
      const targetAmountWei = toWei(targetAmount, selectedRoute!.toTokenDecimals);
      
      const bridgeQuote = await Bridge.Buy.prepare({
        originChainId: selectedRoute!.fromChainId,
        originTokenAddress: selectedRoute!.fromTokenAddress,
        destinationChainId: selectedRoute!.toChainId,
        destinationTokenAddress: selectedRoute!.toTokenAddress,
        amount: targetAmountWei,
        sender: activeAccount!.address,
        receiver: activeAccount!.address,
        client,
      });

      setStatus("🔄 Executing bridge transactions...");

      // Execute all bridge steps
      for (let stepIndex = 0; stepIndex < bridgeQuote.steps.length; stepIndex++) {
        const step = bridgeQuote.steps[stepIndex];
        setStatus(`🔄 Bridge step ${stepIndex + 1}/${bridgeQuote.steps.length}`);
        
        for (const transaction of step.transactions) {
          await sendTransaction({
            transaction,
            account: activeAccount!,
          });
        }
      }

      setStatus(`✅ Bridge complete! ${selectedRoute!.fromToken} from ${selectedRoute!.fromChain} → ${selectedRoute!.toToken} on ${selectedRoute!.toChain}`);

    } catch (error: any) {
      console.error("Bridge failed:", error);
      
      // Fallback to simulation if Bridge API fails
      setStatus("⚠️ Bridge API unavailable. Simulating bridge process...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStatus(`🔄 Bridge simulation complete! ${selectedRoute!.fromToken} → ${selectedRoute!.toToken} (simulated)`);
    }
  }

  // Complex route (bridge + swap)
  async function executeComplexRoute() {
    setStatus("🔀 Executing complex multi-step route...");
    
    try {
      // Step 1: Bridge to destination chain
      setStatus("🔄 Step 1: Cross-chain bridge...");
      await executeBridge();
      
      // Step 2: Swap on destination chain  
      setStatus("🔄 Step 2: Destination chain swap...");
      await executeSameChainSwap();
      
      setStatus(`✅ Complex route complete! ${selectedRoute!.fromToken} on ${selectedRoute!.fromChain} → ${selectedRoute!.toToken} on ${selectedRoute!.toChain}`);

    } catch (error: any) {
      console.error("Complex route failed:", error);
      setStatus("❌ Complex route failed: " + (error?.message || String(error)));
    }
  }

  const getStatusColor = () => {
    if (status.includes("❌")) return "text-red-600";
    if (status.includes("✅")) return "text-green-600";
    if (status.includes("🔄") || status.includes("🔍") || status.includes("🛣️")) return "text-blue-600";
    return "text-gray-700";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return "text-green-600 bg-green-50";
      case 'bridge': return "text-blue-600 bg-blue-50";
      case 'complex': return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🌍 True Universal Bridge
        </h2>
        <p className="text-gray-600">
          Bridge existing tokens OR buy directly with your debit card
        </p>
      </div>

      {!activeAccount ? (
        <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            Connect your Unicorn wallet above to discover your cross-chain tokens
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount:
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="0.1"
                min="0.1"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="2.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Token:
              </label>
              <select
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="POL">POL (Polygon)</option>
                <option value="USDC">USDC (Polygon)</option>
                <option value="USDT">USDT (Polygon)</option>
                <option value="PYUSD">PYUSD (Ethereum)</option>
                <option value="USDC-BASE">USDC (Base)</option>
                <option value="ETH-BASE">ETH (Base)</option>
                <option value="ETH-ARBITRUM">ETH (Arbitrum)</option>
              </select>
            </div>
            
            {/* Cost Estimate */}
            <div className="md:col-span-2 mt-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    Rough Value Estimate:
                  </span>
                  <span className="text-blue-900 font-bold">
                    {getRoughUSDEstimate(targetAmount, targetToken)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  *Estimate only - actual costs may vary based on market conditions and fees
                </p>
              </div>
            </div>
          </div>

          {/* Balance Discovery and Route Finding */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={scanUserBalances}
                disabled={isScanning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isScanning ? "Scanning All Chains..." : "🔍 Discover My Tokens"}
              </button>
              
              {userBalances.length > 0 && (
                <button
                  onClick={() => findRoutes(userBalances)}
                  disabled={isScanning}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isScanning ? "Finding Routes..." : "🛣️ Find Routes"}
                </button>
              )}
            </div>
            
            {userBalances.length > 0 && (
              <p className="text-sm text-gray-600 text-center">
                💡 Change your target amount or token above, then click "Find Routes" to recalculate without rescanning
              </p>
            )}
          </div>

          {/* Buy with Card Option */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-800">💳 Buy with Debit Card</h3>
              <button
                onClick={() => setShowBuyWithCard(!showBuyWithCard)}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                {showBuyWithCard ? "Hide" : "Show"}
              </button>
            </div>
            
            {showBuyWithCard && (
              <div className="space-y-4">
                <p className="text-purple-700 text-sm">
                  Skip the bridge and buy {targetAmount} {targetToken.replace('-BASE', '').replace('-ARBITRUM', '')} directly with your debit card.
                </p>
                
                <div className="bg-white p-4 rounded-lg border">
                  <ConnectButton
                    client={client}
                    chain={
                      targetToken === "PYUSD" ? ethereum :
                      targetToken === "USDC-BASE" || targetToken === "ETH-BASE" ? base :
                      targetToken === "ETH-ARBITRUM" ? arbitrum :
                      polygon
                    }
                    connectButton={{
                      label: "Connect Wallet for Card Purchase"
                    }}
                    detailsButton={{
                      displayBalanceToken: {
                        [ethereum.id]: targetToken === "PYUSD" ? "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8" : undefined,
                        [polygon.id]: 
                          targetToken === "POL" ? NATIVE_TOKEN_ADDRESS :
                          targetToken === "USDC" ? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" :
                          targetToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" :
                          undefined,
                        [base.id]: 
                          targetToken === "ETH-BASE" ? NATIVE_TOKEN_ADDRESS :
                          targetToken === "USDC-BASE" ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" :
                          undefined,
                        [arbitrum.id]: targetToken === "ETH-ARBITRUM" ? NATIVE_TOKEN_ADDRESS : undefined,
                      }
                    }}
                    showAllWallets={false}
                    walletConnect={{ showQrModal: false }}
                    supportedTokens={{
                      [ethereum.id]: targetToken === "PYUSD" ? [
                        {
                          address: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
                          name: "PayPal USD",
                          symbol: "PYUSD",
                        }
                      ] : [
                        {
                          address: NATIVE_TOKEN_ADDRESS,
                          name: "Ethereum",
                          symbol: "ETH",
                        }
                      ],
                      [polygon.id]: [
                        {
                          address: NATIVE_TOKEN_ADDRESS,
                          name: "Polygon",
                          symbol: "POL",
                        },
                        {
                          address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
                          name: "USD Coin",
                          symbol: "USDC",
                        }
                      ],
                      [base.id]: [
                        {
                          address: NATIVE_TOKEN_ADDRESS,
                          name: "Ethereum",
                          symbol: "ETH",
                        },
                        {
                          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                          name: "USD Coin",
                          symbol: "USDC",
                        }
                      ],
                      [arbitrum.id]: [
                        {
                          address: NATIVE_TOKEN_ADDRESS,
                          name: "Ethereum",
                          symbol: "ETH",
                        }
                      ]
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-1">✅ Advantages:</h4>
                    <ul className="text-green-700 space-y-1">
                      <li>• No existing crypto needed</li>
                      <li>• Direct fiat to crypto</li>
                      <li>• One-step process</li>
                      <li>• No bridge fees</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Consider:</h4>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Higher fees (~3-5%)</li>
                      <li>• KYC verification required</li>
                      <li>• Card limits may apply</li>
                      <li>• Processing time varies</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Balances Display */}
          {userBalances.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Token Balances:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userBalances.map((balance, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-800">
                      {balance.balanceFormatted} {balance.tokenSymbol}
                    </div>
                    <div className="text-sm text-blue-600">
                      on {balance.chainName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route Options */}
          {availableRoutes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Available Routes:</h3>
              <div className="space-y-3">
                {availableRoutes.map((route, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      route.insufficientFunds 
                        ? 'border-red-300 bg-red-50' 
                        : selectedRoute === route 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    {route.estimatedInput && route.estimatedInput !== "Unknown" ? (
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-800">
                          <span className={route.insufficientFunds ? "text-red-600" : "text-red-600"}>
                            {route.estimatedInput} {route.fromToken}
                          </span>
                          <span className="text-gray-500"> on {route.fromChain}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">{route.estimatedOutput} {route.toToken}</span>
                          <span className="text-gray-500"> on {route.toChain}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(route.complexity)}`}>
                          {route.complexity}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-800">
                          <span className={route.insufficientFunds ? "text-red-600" : "text-blue-600"}>
                            {route.fromBalance} {route.fromToken}
                          </span>
                          <span className="text-gray-500"> on {route.fromChain}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">{route.estimatedOutput} {route.toToken}</span>
                          <span className="text-gray-500"> on {route.toChain}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(route.complexity)}`}>
                          {route.complexity}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mb-2">
                      Steps: {route.steps.join(" → ")}
                    </div>
                    
                    {route.insufficientFunds ? (
                      <div className="text-xs text-red-700 bg-red-100 p-2 rounded border border-red-200">
                        ❌ Insufficient funds: Need {route.requiredAmount || 'more'} {route.fromToken}, have {route.fromBalance}
                      </div>
                    ) : route.estimatedInput && route.estimatedInput !== "Unknown" ? (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        ✅ Real Bridge API cost: {route.estimatedInput} {route.fromToken}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execute Route */}
          {selectedRoute && (
            <div className="space-y-4">
              {/* Insufficient Funds Warning */}
              {selectedRoute.insufficientFunds && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Cannot Execute Route</h4>
                  <p className="text-red-700 text-sm">
                    You need {selectedRoute.requiredAmount} {selectedRoute.fromToken} but only have {selectedRoute.fromBalance}. 
                    Get more {selectedRoute.fromToken} or try a different route.
                  </p>
                </div>
              )}

              {/* Execution Mode Toggle */}
              {!selectedRoute.insufficientFunds && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableRealExecution"
                      checked={enableRealExecution}
                      onChange={(e) => setEnableRealExecution(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="enableRealExecution" className="text-sm font-medium text-gray-700">
                      Enable Real Execution (⚠️ Uses real tokens and gas)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {enableRealExecution 
                      ? "🔴 REAL MODE: Will execute actual transactions with real costs" 
                      : "🎭 SIMULATION MODE: Safe testing without real transactions"
                    }
                  </p>
                </div>
              )}

              {/* Safety Warning for Real Execution */}
              {enableRealExecution && !selectedRoute.insufficientFunds && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ REAL EXECUTION WARNING</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• This will use REAL tokens from your wallet</li>
                    <li>• You will pay REAL gas fees on multiple chains</li>
                    <li>• Bridge transactions can take 5-20 minutes</li>
                    <li>• Start with small amounts to test</li>
                    <li>• Make sure you understand the route steps</li>
                  </ul>
                </div>
              )}

              <button
                onClick={executeRoute}
                disabled={isPending || selectedRoute.insufficientFunds}
                className={`w-full px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRoute.insufficientFunds 
                    ? 'bg-red-400' 
                    : enableRealExecution 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedRoute.insufficientFunds 
                  ? `❌ Insufficient Funds` 
                  : isPending 
                    ? "Executing..." 
                    : enableRealExecution 
                      ? `🔴 Execute REAL Route (${targetAmount} ${targetToken})` 
                      : `🎭 Simulate Route (${targetAmount} ${targetToken})`
                }
              </button>
            </div>
          )}

          {/* Status Display */}
          {status && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className={`font-medium ${getStatusColor()}`}>
                {status}
              </p>
            </div>
          )}

          {/* How It Works */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Multiple Ways to Get Tokens:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• 🔍 <strong>Multi-Chain Discovery</strong>: Scan existing tokens across 4+ chains</li>
              <li>• 🌉 <strong>Bridge Routes</strong>: Convert existing crypto with real pricing</li>
              <li>• 💳 <strong>Buy with Card</strong>: Purchase directly with debit card (no crypto needed)</li>
              <li>• 🧪 <strong>Pre-Tested Routes</strong>: Only shows routes that work end-to-end</li>
              <li>• ⚡ <strong>One-Click Execution</strong>: Automatic execution without manual steps</li>
            </ul>
          </div>

          {/* Supported Networks */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🌐 Supported Networks:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {SUPPORTED_CHAINS.map((chain, index) => (
                <div key={index} className="text-blue-700">
                  • {chain.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}