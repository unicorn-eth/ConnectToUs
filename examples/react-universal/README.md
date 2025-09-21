# React Universal Example - Complete Wallet Support

**The production-ready solution** that supports ALL wallets while maintaining seamless Unicorn AutoConnect.

## 🎯 Key Features

✅ **Universal Wallet Support**
- Works with MetaMask, WalletConnect, Coinbase, Rainbow, Safe, Trust, and 20+ other wallets
- Full compatibility with Wagmi, RainbowKit, and Web3Modal
- No breaking changes to existing wallet integrations

✅ **Smart Unicorn AutoConnect**
- Automatically connects when accessed via Unicorn App Center
- Silent, non-blocking operation
- Doesn't interfere with manual wallet selection
- Falls back gracefully if auto-connect fails

✅ **Production Ready**
- Transaction approval system with simulation
- Comprehensive error handling
- Mobile responsive
- Iframe compatible

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo>
cd examples/react-universal
npm install

# Run in different modes
npm run dev              # Standard development
npm run dev:unicorn      # Simulate Unicorn environment
npm run dev:standalone   # Force standalone mode
```

## 📁 Project Structure

```
react-universal/
├── src/
│   ├── components/
│   │   ├── UnicornAutoConnect.jsx    # Silent auto-connection
│   │   ├── TransactionDemo.jsx       # Transaction examples
│   │   ├── WalletInfo.jsx           # Wallet status display
│   │   └── TransactionApprovalModal.jsx
│   ├── hooks/
│   │   ├── useUnicornDetection.js   # Environment detection
│   │   ├── useUniversalWallet.js    # Unified wallet hook
│   │   └── useTransactionWithApproval.js
│   ├── config/
│   │   ├── wagmi.js                 # All wallets config
│   │   ├── thirdweb.js              # Unicorn config
│   │   └── rainbowkit.js            # RainbowKit setup
│   ├── App.jsx                      # Main app
│   └── App.css
├── .env.example
├── vite.config.js
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Required
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional (for better RPC performance)
VITE_ALCHEMY_ID=your_alchemy_id
VITE_INFURA_ID=your_infura_id

# Unicorn Configuration (uses defaults if not set)
VITE_UNICORN_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
```

## 🏗️ How It Works

### 1. Environment Detection

The app automatically detects if it's running in a Unicorn environment by checking:
- URL parameters (`walletId=inApp`)
- Iframe context and referrer
- PostMessage communication with parent
- Previous connection history

### 2. Dual-Mode Operation

**Unicorn Mode** (via App Center):
```
User → Unicorn Portal → iframe → Your dApp
         ↓
    Auto-connects silently in background
         ↓
    User ready to transact immediately
```

**Standard Mode** (direct access):
```
User → Your dApp directly
         ↓
    Shows wallet selection (RainbowKit)
         ↓
    User chooses any wallet
         ↓
    Standard connection flow
```

### 3. Non-Blocking Architecture

```jsx
// The key: AutoConnect runs hidden and doesn't block UI
{isUnicornEnvironment && (
  <div style={{ display: 'none' }}>
    <AutoConnect />  {/* Silent, non-blocking */}
  </div>
)}

{/* RainbowKit always available for ALL wallets */}
<ConnectButton />  {/* Users can always choose manually */}
```

## 📊 Wallet Compatibility Matrix

| Wallet | Auto-Connect | Manual Connect | Gasless | Smart Account |
|--------|-------------|----------------|---------|---------------|
| Unicorn | ✅ | ✅ | ✅ | ✅ |
| MetaMask | ❌ | ✅ | ❌ | ❌ |
| WalletConnect | ❌ | ✅ | ❌ | ❌ |
| Coinbase | ❌ | ✅ | ❌ | ❌ |
| Rainbow | ❌ | ✅ | ❌ | ❌ |
| Safe | ❌ | ✅ | ✅ | ✅ |
| All Others | ❌ | ✅ | Varies | Varies |

## 🧪 Testing

### Test Unicorn AutoConnect
```bash
# Method 1: Use npm script
npm run dev:unicorn

# Method 2: Add URL params manually
http://localhost:3000/?walletId=inApp&authCookie=test

# Method 3: Test in actual Unicorn portal
1. Log in to admin.myunicornaccount.com
2. Add your local URL as a custom dApp
3. Access through the portal
```

### Test Standard Wallets
```bash
# Just run normally
npm run dev

# Connect with MetaMask, WalletConnect, etc.
```

### Test Both Modes
```javascript
// In browser console
// Force Unicorn mode
window.__forceUnicornMode?.(true);

// Force standard mode  
window.__forceUnicornMode?.(false);

// Check detection status
window.__getUnicornDebugInfo?.();
```

## 🎨 Customization

### Adding More Wallets

Edit `config/wagmi.js`:
```javascript
import { newWallet } from '@rainbow-me/rainbowkit/wallets';

const wallets = [
  {
    groupName: 'Popular',
    wallets: [
      // ... existing wallets
      newWallet, // Add your wallet
    ],
  },
];
```

### Customizing Auto-Connect Behavior

Edit `components/UnicornAutoConnect.jsx`:
```javascript
<AutoConnect
  client={client}
  wallets={wallets}
  timeout={5000}  // Increase timeout
  onConnect={(wallet) => {
    // Custom logic on connect
  }}
/>
```

### Styling RainbowKit

Edit `App.jsx`:
```javascript
<RainbowKitProvider
  theme={{
    accentColor: '#your-color',
    borderRadius: 'large',
    // ... more theme options
  }}
>
```

## 🚨 Common Issues & Solutions

### Issue: AutoConnect interferes with other wallets
**Solution**: This shouldn't happen with our implementation. AutoConnect runs silently in a hidden div and has error boundaries.

### Issue: Can't connect MetaMask when Unicorn is auto-connected
**Solution**: Users can always disconnect and reconnect with any wallet using the RainbowKit button.

### Issue: CORS errors in iframe
**Solution**: Our `vite.config.js` sets proper headers. For production, ensure your server allows iframe embedding.

### Issue: WalletConnect not working
**Solution**: Make sure you have a valid `VITE_WALLETCONNECT_PROJECT_ID` in your `.env` file.

## 📝 Production Checklist

- [ ] Set production environment variables
- [ ] Configure proper RPC endpoints (Alchemy/Infura)
- [ ] Test in Unicorn portal iframe
- [ ] Test all major wallets
- [ ] Verify mobile responsiveness
- [ ] Check transaction approval flow
- [ ] Submit for Unicorn App Center approval
- [ ] Configure production CORS headers
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test on multiple chains

## 🔗 Resources

- [Unicorn Documentation](https://docs.unicorn.eth)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Thirdweb SDK](https://portal.thirdweb.com)
- [WalletConnect Cloud](https://cloud.walletconnect.com)

## 📄 License

MIT - See LICENSE file for details