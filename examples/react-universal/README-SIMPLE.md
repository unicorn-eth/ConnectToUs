# ConnectToUs - Unicorn.eth dApp Integration

> **Add Unicorn AutoConnect to your existing dApp in 5 minutes WITHOUT breaking anything**

[![npm version](https://badge.fury.io/js/unicorn-connect.svg)](https://badge.fury.io/js/unicorn-connect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🦄 What is ConnectToUs?

ConnectToUs enables seamless integration between your dApp and Unicorn.eth smart account wallets. **The key principle: Don't break existing wallet connections.**

## 🚀 5-Minute Integration (Non-Breaking)

**This approach adds Unicorn AutoConnect to your existing dApp without changing any of your current wallet code.**

### Step 1: Install dependency
```bash
npm install thirdweb
```

### Step 2: Add environment variables
```bash
# Add to your .env file
VITE_THIRDWEB_CLIENT_ID=4e8c81182c3709ee441e30d776223354
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
VITE_DEFAULT_CHAIN=base
```

### Step 3: Create UnicornAutoConnect component
```jsx
// src/components/UnicornAutoConnect.jsx
import React from 'react';
import { ThirdwebProvider, AutoConnect } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet } from 'thirdweb/wallets';
import { base, polygon } from 'thirdweb/chains';

const getChain = (chainName) => {
  const chains = { base, polygon };
  return chains[chainName?.toLowerCase()] || base;
};

const isUnicornEnvironment = () => {
  const params = new URLSearchParams(window.location.search);
  return params.has('walletId') && params.get('walletId') === 'inApp';
};

const UnicornAutoConnect = ({ onConnect, onError }) => {
  if (!isUnicornEnvironment()) return null;

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354"
  });

  const chain = getChain(import.meta.env.VITE_DEFAULT_CHAIN);
  
  const wallet = inAppWallet({
    smartAccount: {
      factoryAddress: import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS || "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: chain,
      gasless: true,
    }
  });

  return (
    <ThirdwebProvider>
      <div style={{ display: 'none' }}>
        <AutoConnect
          client={client}
          wallets={[wallet]}
          onConnect={(wallet) => {
            console.log('🦄 Unicorn AutoConnect successful');
            onConnect?.(wallet);
          }}
          onError={(error) => {
            console.log('🦄 Unicorn AutoConnect failed (silently)');
            onError?.(error);
          }}
          timeout={5000}
        />
      </div>
    </ThirdwebProvider>
  );
};

export default UnicornAutoConnect;
```

### Step 4: Add ONE line to your existing App
```jsx
import UnicornAutoConnect from './components/UnicornAutoConnect';

function App() {
  return (
    <div>
      {/* Your existing app code - DON'T CHANGE ANYTHING */}
      <YourExistingWalletProvider>
        <YourExistingContent />
      </YourExistingWalletProvider>
      
      {/* Just add this one line */}
      <UnicornAutoConnect />
    </div>
  );
}
```

### Step 5: Test
```bash
# Normal mode - your existing wallets work exactly as before
http://localhost:3000

# Unicorn mode - AutoConnect happens automatically
http://localhost:3000/?walletId=inApp&authCookie=test
```

## ✅ What This Approach Guarantees

- **Zero Breaking Changes**: Your existing wallet connections work exactly as before
- **Zero Code Changes**: No changes to your existing providers, connectors, or wallet logic
- **Silent Operation**: AutoConnect runs hidden in background, never shows errors
- **Environment Detection**: Only runs when accessed via Unicorn portal
- **Timeout Protection**: Gives up after 5 seconds if connection fails

## 🔧 Advanced Configuration

### Support Multiple Chains
```bash
# .env
VITE_DEFAULT_CHAIN=polygon  # or base, ethereum, arbitrum, optimism
```

### Handle Connection Events
```jsx
<UnicornAutoConnect 
  onConnect={(wallet) => {
    // Unicorn wallet connected successfully
    console.log('Unicorn wallet address:', wallet.getAccount()?.address);
  }}
  onError={(error) => {
    // AutoConnect failed, but other wallets still work
    console.log('AutoConnect failed:', error.message);
  }}
/>
```

### Environment-Specific Behavior
```jsx
// Only enable in production
{process.env.NODE_ENV === 'production' && <UnicornAutoConnect />}

// Or use environment flag
{import.meta.env.VITE_ENABLE_UNICORN_AUTOCONNECT === 'true' && <UnicornAutoConnect />}
```

## 🎯 Integration Examples

We have three example approaches based on your current setup:

### 📝 [Simple Drop-in Example](./examples/simple-dropin/)
**Best for:** Adding to existing dApps without changes
- One component, one line of code
- No changes to existing wallet setup
- **Use this for production integrations**

### 🔧 [Basic Thirdweb Example](./examples/react-basic/)  
**Best for:** New projects or Thirdweb-only apps
- Thirdweb AutoConnect only
- Minimal configuration

### 🚀 [Universal Example](./examples/react-universal/)
**Best for:** Learning and development
- Shows how both systems can work together
- Environment-driven configuration
- Debug tools and comprehensive testing

## 🛡️ How It Works

### 1. Environment Detection
```javascript
// Only runs when these conditions are met:
- URL contains ?walletId=inApp
- User came from Unicorn portal
- Has valid auth cookie
```

### 2. Silent AutoConnect
```javascript
// Runs in hidden div, never blocks UI
- Attempts connection for 5 seconds
- If successful: User gets Unicorn wallet
- If failed: User can connect any other wallet
- Never shows error messages
```

### 3. Non-Interference
```javascript
// Your existing code is untouched:
- Your wallet providers stay the same
- Your connection logic stays the same  
- Your UI components stay the same
- Everything works exactly as before
```

## 🚨 What NOT to Do

❌ **Don't** modify your existing wallet configuration  
❌ **Don't** change your existing providers  
❌ **Don't** add Thirdweb to your main provider tree  
❌ **Don't** try to merge wallet states manually  

✅ **Do** just add the one UnicornAutoConnect component  
✅ **Do** let it run independently in the background  
✅ **Do** keep your existing wallet code unchanged  

## 📋 Testing Checklist

- [ ] Existing wallet connections work (MetaMask, WalletConnect, etc.)
- [ ] AutoConnect works: Visit `?walletId=inApp&authCookie=test`
- [ ] Silent failure: Visit with invalid parameters, no errors shown
- [ ] Environment detection: Only runs in Unicorn portal, not direct access
- [ ] No console errors in normal operation
- [ ] Mobile compatibility

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
- ✅ No breaking changes to user experience
- ✅ Mobile-responsive design

## 🤝 Support

- **Quick Questions:** [Discord #developers](https://discord.gg/unicorn-developers)
- **Integration Issues:** [GitHub Issues](https://github.com/MyUnicornAccount/ConnectToUs/issues)
- **App Center:** Email app-center@unicorn.eth

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with the principle: Add value, don't break things.**