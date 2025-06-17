# Troubleshooting Guide

## Common Integration Issues

### 🔍 Issue: AutoConnect Not Working

**Symptoms:**
- Component renders but wallet doesn't connect
- No error messages in console
- App seems to load normally but remains disconnected

**Debugging Steps:**

1. **Check Client Configuration**
```javascript
// ❌ Wrong - missing or incorrect client ID
const client = createThirdwebClient({ clientId: "" });

// ✅ Correct - use the official Unicorn client ID
const client = createThirdwebClient({ 
  clientId: "4e8c81182c3709ee441e30d776223354" 
});
```

2. **Verify Wallet Configuration**
```javascript
// ❌ Wrong - missing required fields
const wallets = [inAppWallet()];

// ✅ Correct - complete smart account configuration
const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    }
  })
];
```

3. **Add Debug Logging**
```javascript
<AutoConnect
  client={client}
  wallets={wallets}
  onConnect={(wallet) => {
    console.log("✅ Connected successfully:", wallet);
    console.log("Address:", wallet.getAddress());
    console.log("Chain:", wallet.getChain());
  }}
  onError={(error) => {
    console.error("❌ Connection failed:", error);
    console.error("Error details:", error.message);
  }}
/>
```

---

### 🚫 Issue: "Unauthorized dApp" Error

**Symptoms:**
- Connection attempt shows "unauthorized" or "not whitelisted" error
- dApp works in development but fails in production

**Solutions:**

1. **Submit for App Center Review**
   - Your dApp must be approved before users can connect
   - Fill out: https://forms.gle/3kyuEce2fZtd7Umy9
   - Wait for approval (typically 1-2 weeks)

2. **Check Domain Matching**
   - Ensure your submitted domain exactly matches your deployed URL
   - `https://myapp.com` ≠ `https://www.myapp.com`
   - Subdomains must be specified separately

3. **Verify Integration Requirements**
   - AutoConnect component must be present and configured correctly
   - All required parameters must be included
   - Test locally first to ensure basic functionality

---

### 🔗 Issue: Wrong Network Connection

**Symptoms:**
- Wallet connects but to wrong blockchain
- Transactions fail with "unsupported network" errors
- Chain switching doesn't work automatically

**Solutions:**

1. **Check Chain Configuration**
```javascript
// ❌ Wrong - using mainnet instead of polygon
import { mainnet } from "thirdweb/chains";

// ✅ Correct - Unicorn wallets use Polygon
import { polygon } from "thirdweb/chains";

const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon, // Must be polygon
      gasless: true,
    }
  })
];
```

2. **Verify Factory Address**
   - Factory address is chain-specific
   - Polygon: `0xD771615c873ba5a2149D5312448cE01D677Ee48A`
   - Using wrong address will cause connection failures

3. **Handle Chain Switching Properly**
```javascript
import { useActiveWallet } from "thirdweb/react";

function useChainValidation() {
  const wallet = useActiveWallet();
  
  useEffect(() => {
    if (wallet) {
      const currentChain = wallet.getChain();
      if (currentChain?.id !== polygon.id) {
        console.warn("⚠️ Connected to wrong chain:", currentChain?.name);
        // AutoConnect should handle this, but log for debugging
      }
    }
  }, [wallet]);
}
```

---

### 💸 Issue: Transactions Failing

**Symptoms:**
- Wallet connects successfully but transactions fail
- "Insufficient funds" errors despite gasless setup
- Transaction reverts unexpectedly

**Solutions:**

1. **Verify Gasless Configuration**
```javascript
// ❌ Wrong - gasless not enabled
const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      // gasless: false // Missing or disabled
    }
  })
];

// ✅ Correct - gasless enabled
const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true, // Essential for gas sponsorship
    }
  })
];
```

2. **Check Transaction Preparation**
```javascript
// ❌ Wrong - missing required parameters
const transaction = prepareContractCall({
  contract,
  method: "transfer",
  // params missing
});

// ✅ Correct - complete transaction setup
const transaction = prepareContractCall({
  contract,
  method: "transfer", 
  params: [recipientAddress, amount],
});
```

3. **Add Transaction Error Handling**
```javascript
try {
  const result = await sendTransaction({
    transaction,
    account,
  });
  console.log("✅ Transaction success:", result.transactionHash);
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    console.error("❌ Gasless sponsorship failed - contact support");
  } else if (error.message.includes("user rejected")) {
    console.error("❌ User cancelled transaction");
  } else {
    console.error("❌ Transaction failed:", error.message);
  }
}
```

---

### 📱 Issue: Mobile Compatibility Problems

**Symptoms:**
- Works on desktop but fails on mobile
- Connection timeout on mobile browsers
- UI elements not responsive

**Solutions:**

1. **Add Mobile-Specific Configuration**
```javascript
// Enhanced wallet config for mobile
const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    },
    // Mobile-friendly options
    metadata: {
      name: "Your dApp Name",
      description: "Brief description for mobile users",
      url: "https://yourdapp.com",
      icons: ["https://yourdapp.com/icon-192.png"],
    },
  })
];
```

2. **Responsive Design Considerations**
```css
/* Ensure AutoConnect works on mobile */
@media (max-width: 768px) {
  .wallet-connection {
    padding: 10px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  /* Make buttons touch-friendly */
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

3. **Test Mobile Connection Flow**
   - Test on actual devices, not just browser dev tools
   - Verify connection works in mobile browsers
   - Check that wallet switching works properly

---

### 🔄 Issue: Development vs Production Differences

**Symptoms:**
- Works perfectly in development
- Fails when deployed to production
- Different behavior across environments

**Solutions:**

1. **Environment Configuration**
```javascript
// Use environment-aware configuration
const getClientConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    clientId: "4e8c81182c3709ee441e30d776223354", // Same for all envs
    // Add any environment-specific settings here
  };
};

const client = createThirdwebClient(getClientConfig());
```

2. **URL Whitelist Verification**
   - Development: `http://localhost:3000`
   - Staging: `https://staging.yourdapp.com`
   - Production: `https://yourdapp.com`
   - Each URL must be separately approved

3. **HTTPS Requirements**
   - Production MUST use HTTPS
   - Local development can use HTTP
   - Mixed content policies can block connections

---

### ⚙️ Issue: Framework-Specific Problems

#### React/Next.js Issues

**Server-Side Rendering Conflicts:**
```javascript
// ❌ Wrong - using hooks in SSR context
function App() {
  const account = useActiveAccount(); // Fails in SSR
  return <div>{account?.address}</div>;
}

// ✅ Correct - handle SSR properly  
function App() {
  const [mounted, setMounted] = useState(false);
  const account = useActiveAccount();
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <div>Loading...</div>;
  return <div>{account?.address}</div>;
}
```

#### Wagmi Integration Issues

**Connector Configuration:**
```javascript
// ❌ Wrong - missing required parameters
const config = createConfig({
  chains: [polygon],
  connectors: [inAppWalletConnector({ client })], // Incomplete
});

// ✅ Correct - complete connector setup
const config = createConfig({
  chains: [polygon],
  connectors: [
    inAppWalletConnector({
      client,
      smartAccount: {
        sponsorGas: true,
        chain: polygon,
        factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      },
    }),
  ],
  transports: {
    [polygon.id]: http(),
  },
});
```

---

## 🛠️ Debugging Tools & Commands

### Console Debugging
```javascript
// Add to your app for debugging
window.debugUnicorn = {
  client,
  wallets,
  checkConnection: () => {
    const wallet = useActiveWallet();
    const account = useActiveAccount();
    console.log("Wallet:", wallet);
    console.log("Account:", account);
    console.log("Chain:", wallet?.getChain());
  }
};
```

### Network Inspection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for failed requests to Thirdweb APIs
4. Check for CORS errors or 403 responses

### Local Testing Checklist
- [ ] AutoConnect component renders without errors
- [ ] Console shows successful connection logs
- [ ] Wallet address displays correctly  
- [ ] Chain ID matches expected network (137 for Polygon)
- [ ] Test transaction succeeds
- [ ] Error handling works for edge cases

---

## 🆘 Getting Help

### Before Asking for Help
1. **Check this troubleshooting guide thoroughly**
2. **Review the main README.md for setup steps**
3. **Test with the provided example code**
4. **Include relevant error messages and logs**

### Where to Get Support

**GitHub Issues:** [Create an issue](https://github.com/MyUnicornAccount/ConnectToUs/issues)
- Use for: Integration problems, bug reports, feature requests
- Include: Code snippets, error messages, environment details

**Discord Community:** [Join #developers channel](https://discord.gg/unicorn-developers)  
- Use for: Quick questions, real-time troubleshooting
- Share: Screenshots, logs, specific error cases

**App Center Support:** Email support@myunicornaccount.com
- Use for: Approval questions, whitelist issues
- Include: Your dApp URL, submission details

### Issue Template
When reporting issues, please include:

```
**Environment:**
- Framework: React/Vue/Vanilla JS
- Node version: 
- Package versions: thirdweb@X.X.X
- Browser: Chrome/Safari/Firefox
- Platform: Desktop/Mobile

**Expected Behavior:**
What should happen?

**Actual Behavior:** 
What actually happens?

**Code Sample:**
```javascript
// Minimal code that reproduces the issue
```

**Error Messages:**
```
// Console errors, network failures, etc.
```

**Additional Context:**
Any other relevant information
```

---

## 📋 Quick Reference

### Essential Configuration Values
```javascript
// Always use these exact values and select the appropriate chain. All our examples use polygon for consistency
const CLIENT_ID = "4e8c81182c3709ee441e30d776223354";
const FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";
const CHAIN = polygon; // Chain ID: 137 
```

### Minimum Working Example
```javascript
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { AutoConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354",
});

const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    }
  })
];

function App() {
  return (
    <ThirdwebProvider>
      <AutoConnect client={client} wallets={wallets} />
      {/* Your app content */}
    </ThirdwebProvider>
  );
}
```

If this minimum example doesn't work, there's likely an environment or approval issue rather than a code problem.