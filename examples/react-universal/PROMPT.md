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

**Unicorn Configuration:**
```javascript
Client ID: "4e8c81182c3709ee441e30d776223354"
Factory Address: "0xD771615c873ba5a2149D5312448cE01D677Ee48A"  
Chain: Polygon
Features: Gasless transactions, Smart Account (AA)
```

## Current Project Structure

```
examples/react-universal/
├── index.html                    # Root HTML (MUST be in root, not src/)
├── package.json                  # Dependencies configured
├── vite.config.js               # Web3 polyfills configured
├── .env                         # Needs VITE_WALLETCONNECT_PROJECT_ID
├── src/
│   ├── main.jsx                 # Entry point with polyfills
│   ├── index.css               # Global styles
│   ├── App.jsx                 # Main app with providers
│   ├── App.css                 # App styles
│   ├── components/
│   │   ├── UnicornAutoConnect.jsx    # Silent auto-connection
│   │   ├── TransactionDemo.jsx       # Demo transactions
│   │   └── WalletInfo.jsx           # Wallet status display
│   ├── hooks/
│   │   └── useUnicornDetection.js   # Detects Unicorn environment
│   └── config/
│       └── wagmi.js                  # All wallets configuration
```

## Key Code Patterns

### 1. Non-Blocking AutoConnect Pattern
```jsx
// AutoConnect runs hidden, doesn't block UI
{isUnicornEnvironment && (
  <div style={{ display: 'none' }}>
    <AutoConnect 
      client={thirdwebClient}
      wallets={unicornWallets}
      timeout={3000}
      onError={(e) => console.log('Silent fail, manual connect available')}
    />
  </div>
)}

// RainbowKit always visible for ALL wallets
<ConnectButton />
```

### 2. Environment Detection
```javascript
// Check multiple signals for Unicorn environment
- URL params: ?walletId=inApp&authCookie=xxx
- iframe context + referrer from myunicornaccount.com
- PostMessage communication with parent
- LocalStorage hints from previous connections
```

## Problems We Solved

1. **AutoConnect was blocking other wallets** → Made it run silently in background
2. **Package compatibility issues** → Used correct versions and polyfills
3. **Wrong file structure** → index.html must be in root, not src/
4. **Import errors** → Fixed paths and extensions

## What's Working

✅ Universal wallet support via RainbowKit/Wagmi  
✅ Silent Unicorn AutoConnect when in App Center  
✅ Environment detection (iframe, URL params, etc.)  
✅ Transaction demos with gasless for Unicorn  
✅ Mobile responsive design  
✅ Production error handling  

## What Needs Attention

1. **Environment Variables**: Need to add actual WalletConnect Project ID to `.env`
2. **Testing**: Need to test in actual Unicorn App Center iframe
3. **Transaction Approval**: Optional modal system for transaction approvals
4. **Documentation**: Update main repo README with this universal example

## Testing Instructions

```bash
# Standard mode (all wallets)
npm run dev

# Simulate Unicorn mode  
npm run dev:unicorn
# OR visit: http://localhost:3000/?walletId=inApp&authCookie=test

# Debug if not working
node test-setup.js  # Checks all files are in place
```

## Key Files to Reference

1. **App.jsx** - Shows provider setup with RainbowKit + Thirdweb
2. **UnicornAutoConnect.jsx** - Silent auto-connection implementation
3. **wagmi.js** - Configuration for ALL wallet types
4. **useUnicornDetection.js** - Smart environment detection

## GitHub Repository Context

This is for the MyUnicornAccount/ConnectToUs repository which provides integration guides for developers. We have:
- `examples/react-basic/` - Simple Thirdweb-only example
- `examples/react-wagmi/` - Basic Wagmi integration  
- `examples/react-universal/` - THIS example (production-ready, all wallets)

## Success Criteria

The dApp must:
1. Work with ANY wallet when accessed directly
2. Auto-connect Unicorn wallet when in App Center (without blocking other options)
3. Never force users into Unicorn-only mode
4. Handle errors gracefully
5. Work on mobile devices
6. Be production-ready with proper error handling

## Additional Notes

- Thirdweb SDK handles Unicorn's smart accounts and gasless transactions
- RainbowKit provides the UI for wallet selection
- Wagmi manages wallet connections and blockchain interactions
- The solution must be truly universal - one codebase that adapts to context

## Questions to Continue With

If restarting this project:
1. "Show me the current App.jsx and help me fix any import errors"
2. "Help me debug why the page isn't loading at localhost:3000"
3. "How do I test the Unicorn AutoConnect functionality?"
4. "Can you create the TransactionApprovalModal component we discussed?"
5. "How do I submit this to the Unicorn App Center for approval?"

## Command Summary

```bash
# Setup
npm install
cp .env.example .env
# Edit .env with WalletConnect Project ID

# Run
npm run dev              # Normal mode
npm run dev:unicorn     # Test Unicorn mode

# Debug
node test-setup.js      # Check setup
npm run dev -- --debug  # Verbose output
```

---

**Project Status**: Core implementation complete, needs testing and minor fixes for import paths. Main challenge was making AutoConnect non-blocking while supporting all wallets.