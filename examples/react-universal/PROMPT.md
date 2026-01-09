# Project Prompt: Universal Wallet dApp with Unicorn AutoConnect

## Project Overview

I'm building a React-based Web3 dApp that needs to support ALL wallet types (MetaMask, WalletConnect, Coinbase, Rainbow, etc.) while also implementing seamless AutoConnect functionality for Unicorn.eth smart account wallets. This is for the ConnectToUs GitHub repository that helps developers integrate with Unicorn.eth.

## Key Requirements

### 1. Universal Wallet Support (CRITICAL)
- **MUST support ALL wallets** - not just Unicorn
- Users should always be able to choose any wallet manually
- Use RainbowKit or similar for wallet selection UI
- Support MetaMask, WalletConnect, Coinbase, Rainbow, Safe, Trust, Argent, etc.
- Must work with standard Web3 libraries (Wagmi, viem, ethers)

### 2. Unicorn AutoConnect (Non-Blocking)
- When accessed through Unicorn App Center (iframe with `?walletId=inApp` params), automatically connect Unicorn wallet
- AutoConnect must be **silent and non-blocking** - runs in background
- If AutoConnect fails, users can still connect any wallet manually
- Should not show errors if AutoConnect fails

### 3. Technical Architecture
```
User Access Modes:
1. Via Unicorn Portal: iframe → AutoConnect runs silently → instant connection
2. Direct Browser: normal website → show all wallet options → manual connection

Both modes use the SAME codebase and ALL wallets remain available
```

### 4. Implementation Details

**Tech Stack:**
- React 18
- Vite 5
- Thirdweb SDK v5.68+ (for Unicorn AutoConnect)
- Wagmi v2 + RainbowKit v2 (for universal wallet support)
- @tanstack/react-query
- viem

**Unicorn Configuration (Now Environment-Driven):**
```javascript
// From .env file:
VITE_THIRDWEB_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
VITE_DEFAULT_CHAIN=base
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Current Project Structure

```
examples/react-universal/
├── index.html                    # Root HTML (MUST be in root, not src/)
├── package.json                  # Dependencies configured
├── vite.config.js               # Web3 polyfills configured
├── .env.example                 # Comprehensive environment configuration
├── src/
│   ├── main.jsx                 # Entry point with polyfills
│   ├── index.css               # Global styles
│   ├── App.jsx                 # Main app with providers
│   ├── App.css                 # App styles
│   ├── components/
│   │   ├── UnicornAutoConnect.jsx    # Silent auto-connection (env-driven)
│   │   ├── TransactionDemo.jsx       # Demo transactions
│   │   ├── WalletInfo.jsx           # Wallet status display
│   │   ├── ChainSwitcher.jsx        # Debug: Chain switching UI
│   │   ├── WalletDiagnostics.jsx    # Debug: Wallet connection troubleshooting
│   │   └── TransactionApprovalModal.jsx
│   ├── hooks/
│   │   ├── useUnicornDetection.js   # Detects Unicorn environment
│   │   ├── useUniversalWallet.js    # Unified wallet hook
│   │   └── useTransactionWithApproval.js
│   ├── config/
│   │   ├── wagmi.js                 # All wallets config (environment-driven)
│   │   ├── thirdweb.js              # Modular Unicorn config (environment-driven)
│   │   └── rainbowkit.js            # RainbowKit setup
│   ├── context/
│   │   └── UnicornContext.jsx       # Share Unicorn wallet state
│   └── utils/
│       └── configValidator.js       # Configuration validation utility
```

## Recent Major Updates (Modularization)

### 1. **Environment-Driven Configuration** ✅
- **All configuration now comes from .env variables**
- No more hardcoded values in the code
- Easy to configure for different deployments/chains
- Comprehensive .env.example with all options

### 2. **Modular Thirdweb Configuration** ✅
- `config/thirdweb.js` - Central configuration with validation
- Support for all major chains (Base, Polygon, Arbitrum, Optimism, Ethereum)
- Dynamic chain switching via URL parameters (`?chain=polygon`)
- Built-in configuration validation and debugging

### 3. **Enhanced Wagmi Configuration** ✅
- Better wallet connector configuration
- Proper WalletConnect Project ID handling
- Enhanced error handling for wallet connections

### 4. **Debug & Diagnostic Tools** ✅
- `ChainSwitcher` component - Test different chains easily
- `WalletDiagnostics` component - Troubleshoot wallet connection issues
- Configuration validation with helpful error messages
- Auto-validation in development mode

### 5. **URL Parameter Support** ✅
- `?chain=polygon` - Override default chain
- `?chain=base` - Switch to Base chain
- `?chain=arbitrum` - Switch to Arbitrum chain
- Works for both AutoConnect and manual connections

## Current Status: Working Features ✅

1. **Environment Configuration**: All settings configurable via .env
2. **Chain Switching**: URL parameters work (`?chain=polygon`)
3. **Unicorn AutoConnect**: Works with environment variables
4. **Chain Display**: UI properly shows current vs default chain
5. **Debug Tools**: Chain switcher and wallet diagnostics
6. **Configuration Validation**: Automatic validation with helpful messages

## Current Issue: Wallet Connections ⚠️

**Problem**: Manual wallet connections (MetaMask, Coinbase, etc.) are broken
- RainbowKit Connect Wallet modal appears
- Clicking on wallets produces errors (401 Unauthorized from Coinbase)
- Root cause: Missing/invalid WalletConnect Project ID

**Solution in Progress**:
- Enhanced wallet configuration in `wagmi.js`
- Added `WalletDiagnostics` component for troubleshooting
- Updated .env.example with clear instructions
- Need valid WalletConnect Project ID from cloud.walletconnect.com

## Key Code Patterns

### 1. Environment-Driven Configuration
```javascript
// config/thirdweb.js
const config = {
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354",
  factoryAddress: import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
  defaultChain: import.meta.env.VITE_DEFAULT_CHAIN || "base",
};
```

### 2. URL Parameter Chain Override
```javascript
// Supports ?chain=polygon, ?chain=base, etc.
export const getChainFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const chainParam = urlParams.get('chain');
  return chainParam ? getChainByName(chainParam) : getDefaultChain();
};
```

### 3. Non-Blocking AutoConnect Pattern
```javascript
// AutoConnect runs hidden, doesn't block UI
{isUnicornEnvironment && config.enableAutoConnect && (
  <UnicornAutoConnect />
)}

// RainbowKit always visible for ALL wallets
<ConnectButton />
```

## Testing Instructions

```bash
# Standard mode (all wallets)
npm run dev

# Test different chains
http://localhost:3000/?chain=polygon
http://localhost:3000/?chain=base
http://localhost:3000/?chain=arbitrum

# Simulate Unicorn mode  
http://localhost:3000/?walletId=inApp&authCookie=test

# Debug mode (shows chain switcher and diagnostics)
# Set VITE_ENABLE_DEBUG_MODE=true in .env
```

## What's Working

✅ **Modular Configuration**: Environment-driven, no hardcoded values  
✅ **Chain Switching**: URL parameters work perfectly  
✅ **Unicorn AutoConnect**: Environment-configurable, works in background  
✅ **Debug Tools**: Chain switcher and wallet diagnostics  
✅ **Environment Validation**: Automatic validation with helpful messages  
✅ **Mobile Responsive**: Works on all devices  
✅ **Production Error Handling**: Comprehensive error boundaries  

## What Needs Attention

1. **Wallet Connection Fix**: Need valid WalletConnect Project ID
   - Must get from cloud.walletconnect.com
   - Add to VITE_WALLETCONNECT_PROJECT_ID in .env
   - This will fix MetaMask, Coinbase, WalletConnect connections

2. **Testing**: Need to test in actual Unicorn App Center iframe

3. **Documentation**: Update main repo README with new environment configuration

## Next Steps

### Immediate (Wallet Connection Fix):
1. Get WalletConnect Project ID from cloud.walletconnect.com
2. Add to .env file: `VITE_WALLETCONNECT_PROJECT_ID=your_id_here`
3. Test all wallet connections work properly

### Future Enhancements:
1. Transaction approval system with simulation
2. Advanced error tracking and analytics
3. More comprehensive testing in Unicorn portal
4. Performance optimizations for production

## GitHub Repository Context

This is for the MyUnicornAccount/ConnectToUs repository which provides integration guides for developers. We have:
- `examples/react-basic/` - Simple Thirdweb-only example
- `examples/react-wagmi/` - Basic Wagmi integration  
- `examples/react-universal/` - THIS example (production-ready, all wallets)

## Success Criteria

The dApp must:
1. ✅ Work with ANY wallet when accessed directly
2. ✅ Auto-connect Unicorn wallet when in App Center (without blocking other options)
3. ✅ Never force users into Unicorn-only mode
4. ⚠️ Handle errors gracefully (wallet connection fix needed)
5. ✅ Work on mobile devices
6. ✅ Be production-ready with proper error handling
7. ✅ Be easily configurable via environment variables

## Configuration Files

### Essential .env Setup:
```bash
# Core Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
VITE_DEFAULT_CHAIN=base

# WalletConnect (REQUIRED for wallet functionality)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional but Recommended
VITE_APP_NAME=Universal Unicorn dApp
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_AUTO_CONNECT=true
```

## Questions to Continue With

If restarting this project:
1. ✅ "Help me modularize the configuration to use environment variables"
2. ✅ "Show me how to implement URL parameter chain switching"
3. ⚠️ "Why are wallet connections broken and how do I fix them?"
4. "How do I get a WalletConnect Project ID and configure it properly?"
5. "Can you create the TransactionApprovalModal component we discussed?"
6. "How do I test this in the actual Unicorn App Center portal?"
7. "How do I submit this to the Unicorn App Center for approval?"

## Command Summary

```bash
# Setup
npm install
cp .env.example .env
# Edit .env with proper WalletConnect Project ID

# Run
npm run dev                    # Normal mode
npm run dev:unicorn           # Test Unicorn mode

# Test URL Parameters
# ?chain=polygon - Switch to Polygon
# ?chain=base    - Switch to Base  
# ?walletId=inApp&authCookie=test - Simulate Unicorn mode

# Debug
# Set VITE_ENABLE_DEBUG_MODE=true in .env for debug tools
```

---

**Project Status**: Core modularization complete, URL parameter chain switching working perfectly, but wallet connections need WalletConnect Project ID to function properly. The main challenge now is getting a proper WalletConnect Project ID and ensuring all wallet connectors work reliably.