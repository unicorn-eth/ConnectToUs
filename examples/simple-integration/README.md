# Simple Unicorn Integration Example

> **Add Unicorn AutoConnect to your existing dApp in 5 minutes without breaking anything**

This example shows the **correct way** to add Unicorn.eth AutoConnect to an existing dApp that already has wallet connections (RainbowKit, Wagmi, etc.) without modifying any existing code.

## 🎯 The Goal

**Add Unicorn AutoConnect support while keeping your existing wallet setup exactly as it is.**

- ✅ **Zero breaking changes** to existing code
- ✅ **Unified wallet interface** - both wallet types work with same app functionality
- ✅ **Real transactions** - MetaMask shows approval popup, Unicorn is gasless
- ✅ **User choice** - easy switching between wallet types

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo>
cd examples/simple-integration
npm install

# Set up environment
cp .env.example .env
# Add your WalletConnect Project ID

# Run the example
npm run dev
```

## 📁 Project Structure

```
simple-integration/
├── src/
│   ├── components/
│   │   ├── UnicornAutoConnect.jsx     # 📦 Drop-in component (copy this)
│   │   └── ExistingAppContent.jsx     # 📖 Example implementation
│   ├── hooks/
│   │   └── useUniversalWallet.js      # 🔧 Bridge hook (copy this)
│   ├── App.jsx                        # 🎯 Clean integration example
│   └── main.jsx
├── .env.example                       # ⚙️ Minimal configuration
└── package.json                       # 📦 Minimal dependencies
```

## 🔍 What to Copy to Your Project

### **Required Files (Copy These):**

1. **`src/components/UnicornAutoConnect.jsx`** - The core AutoConnect component
   - Isolated React root (no conflicts)
   - Environment detection
   - Silent operation

2. **`src/hooks/useUniversalWallet.js`** - The bridge hook
   - Unified interface for both wallet types
   - Drop-in replacement for `useAccount()`

### **Integration Steps:**

**Step 1: Install dependency**
```bash
npm install thirdweb
```

**Step 2: Add environment variables**
```bash
# .env
VITE_THIRDWEB_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
VITE_DEFAULT_CHAIN=base
```

**Step 3: Copy files to your project**
- Copy `UnicornAutoConnect.jsx` → your `src/components/`
- Copy `useUniversalWallet.js` → your `src/hooks/`

**Step 4: Add ONE line to your App.jsx**
```jsx
import UnicornAutoConnect from './components/UnicornAutoConnect';

function App() {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <YourExistingApp />
        
        {/* Just add this one line */}
        <UnicornAutoConnect />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
```

**Step 5: Update your components**
```jsx
// Before:
import { useAccount } from 'wagmi';
const { address, isConnected } = useAccount();

// After:
import { useUniversalWallet } from './hooks/useUniversalWallet';
const wallet = useUniversalWallet();
// wallet.address and wallet.isConnected work with BOTH wallet types!
```

**That's it!** Your existing app functionality now works with both Unicorn and standard wallets.

## ✅ What This Approach Guarantees

- **Zero Breaking Changes**: Existing wallet connections work exactly as before
- **Zero Learning Curve**: Same patterns you already use
- **Silent Operation**: AutoConnect runs hidden, never shows errors
- **Environment Detection**: Only runs when accessed via Unicorn portal
- **Real Transactions**: MetaMask users get real on-chain transactions with approval popups
- **Gasless Enhancement**: Unicorn users get automatic gasless transactions

## 🧪 Testing the Integration

### Test 1: Normal Operation
Visit: `http://localhost:3000`

**Expected Result**: 
- Your existing wallet connections work exactly as before
- Connect with MetaMask, Rainbow, Coinbase, etc.
- Real transactions with approval popups
- No AutoConnect attempts

### Test 2: Unicorn AutoConnect
Visit: `http://localhost:3000/?walletId=inApp&authCookie=test`

**Expected Result**:
- AutoConnect attempts automatically in background
- If successful: Unicorn wallet connects (gasless transactions)
- If failed: Manual wallet selection still available
- Your app functionality works the same way

### Test 3: Wallet Switching
1. Start with Unicorn connected (use URL params)
2. Click "Disconnect Unicorn" 
3. Connect with MetaMask
4. Same app features work with both wallet types

### Test 4: Real Transactions
- **With MetaMask**: Click demo transaction → MetaMask popup appears → Real on-chain transaction
- **With Unicorn**: Click demo transaction → No popup → Gasless (simulated in demo)

## 🎯 How It Works

### **Unified Wallet Interface**
The `useUniversalWallet()` hook creates a unified interface:

```javascript
const wallet = useUniversalWallet();

// Works with both Unicorn and standard wallets:
wallet.isConnected  // true if any wallet connected
wallet.address      // address from either wallet type
wallet.connector    // wallet connector info
wallet.isUnicorn    // true if using Unicorn (gasless)
wallet.isStandard   // true if using standard wallet
```

### **Existing Code Compatibility**
Your existing transaction code just works:

```javascript
// Your existing feature component
function YourFeature() {
  const wallet = useUniversalWallet(); // Instead of useAccount()
  const { sendTransaction } = useSendTransaction();
  
  const handleAction = async () => {
    if (wallet.isUnicorn) {
      // Unicorn wallet - use Thirdweb (gasless)
      await unicornWallet.sendTransaction(tx);
    } else {
      // Standard wallet - use existing Wagmi flow
      await sendTransaction(tx); // Shows approval popup
    }
  };
  
  return (
    <button onClick={handleAction}>
      {wallet.isUnicorn ? 'Execute (Gasless)' : 'Execute (Requires Gas)'}
    </button>
  );
}
```

### **No Provider Conflicts**
`UnicornAutoConnect` uses an **isolated React root** to avoid conflicts:
- Thirdweb runs in separate React tree
- No state update warnings
- No interference with existing providers
- Custom events for communication

## 🔧 Configuration Options

### Basic Usage (Recommended)
```jsx
<UnicornAutoConnect />
```

### With Custom Configuration
```jsx
<UnicornAutoConnect
  clientId="your-thirdweb-client-id"
  factoryAddress="0x..."
  defaultChain="polygon"
  timeout={5000}
  debug={true}
  onConnect={(wallet) => {
    console.log('Unicorn wallet connected');
  }}
  onError={(error) => {
    console.log('AutoConnect failed');
  }}
/>
```

## 📋 Integration Checklist

When integrating into your existing dApp:

- [ ] Install `thirdweb` dependency
- [ ] Copy `UnicornAutoConnect.jsx` component
- [ ] Copy `useUniversalWallet.js` hook
- [ ] Add environment variables
- [ ] Add `<UnicornAutoConnect />` to App
- [ ] Replace `useAccount()` with `useUniversalWallet()` in components
- [ ] Test normal wallet connections still work
- [ ] Test Unicorn AutoConnect with URL parameters
- [ ] Test real transactions with MetaMask (approval popup shows)
- [ ] Test wallet switching between Unicorn and standard
- [ ] Deploy and submit to Unicorn App Center

## 🚨 Common Issues

### Issue: MetaMask transactions don't show approval popup
**Solution**: Make sure you're using the real `useSendTransaction` hook from Wagmi, not a simulation.

### Issue: React warnings about state updates
**Solution**: The isolated AutoConnect component should prevent this. Make sure you're using the latest version that creates its own React root.

### Issue: Unicorn wallet doesn't connect
**Solution**: 
1. Check URL parameters are correct (`?walletId=inApp&authCookie=...`)
2. Verify environment variables are set
3. Check browser console for debug messages (set `debug={true}`)

## 🔗 App Center Submission

Once integration is complete:

1. **Test thoroughly** using the checklist above
2. **Deploy your dApp** to a public URL  
3. **Fill out the submission form**: [App Center Form](https://forms.gle/3kyuEce2fZtd7Umy9)
4. **Wait for review** - typical approval time is 1-2 weeks

### Submission Requirements

- ✅ Working UnicornAutoConnect integration
- ✅ Deployed dApp with public URL
- ✅ All existing wallet connections still work
- ✅ Real transactions with approval popups for standard wallets
- ✅ No breaking changes to user experience
- ✅ Mobile-responsive design

## 📞 Support

- **Quick Questions:** [Discord #developers](https://discord.gg/unicorn-developers)
- **Integration Issues:** [GitHub Issues](https://github.com/MyUnicornAccount/ConnectToUs/issues)
- **App Center:** Email app-center@unicorn.eth

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with the principle: Enhance existing apps without breaking anything.**