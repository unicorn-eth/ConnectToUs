# Unicorn.eth AutoConnect Example

A minimal React dapp demonstrating how to restrict access to existing unicorn.eth smart wallet holders using Thirdweb's AutoConnect feature.

## 🎯 URL Parameters

This example supports URL parameters for dynamic configuration:

### Supported Parameters

- **`chain`**: Specify the blockchain network (or just use the one you want in the code)
  - Supported: `polygon`, `base`, `arbitrum`, `optimism`, `ethereum`, `mainnet`
  - Default: `polygon`
  - Example: `?chain=base`

- **`walletID`**: Pass wallet identifier (logged for debugging)
  - Example: `?walletID=user123`

- **`authCookie`**: Pass authentication cookie (logged for debugging)
  - Example: `?authCookie=abc123`

### Example URLs

```
# Default polygon
https://yourapp.com/

# Base chain
https://yourapp.com/?chain=base

# Multiple parameters
https://yourapp.com/?chain=arbitrum&walletID=user123&authCookie=xyz789
```

## 🦄 What This Example Shows

- **Exclusive Access**: Only users with existing unicorn.eth smart wallets can connect
- **AutoConnect**: Automatically detects and connects existing smart wallets
- **Simple Authorization**: Clean authorization flow with visual feedback
- **No Manual Connect**: Users don't need to manually connect - it happens automatically

## 📁 Project Structure

```
unicorn-autoconnect-example/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css
└── README.md
```

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd unicorn-autoconnect-example
npm install

# Configure environment
cp .env.example .env
# Add your VITE_THIRDWEB_CLIENT_ID

# Run development server
npm run dev
```

## 📄 File Contents

### package.json
```json
{
  "name": "unicorn-autoconnect-example",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "thirdweb": "^5.107.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.2",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.0",
    "vite": "^7.1.6"
  }
}
```

### .env.example
```env
# Get your client ID from https://thirdweb.com/dashboard
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Unicorn.eth factory address (defaults to main factory if not set)
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
})
```

### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unicorn.eth AutoConnect Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### src/main.jsx
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🔧 How It Works

### 1. AutoConnect Configuration
```javascript
// Parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    chain: params.get('chain'),
    walletID: params.get('walletID'),
    authCookie: params.get('authCookie')
  };
};

// Dynamic chain selection
const getChainByName = (chainName) => {
  const chains = {
    'polygon': polygon,
    'base': base,
    'arbitrum': arbitrum,
    'optimism': optimism,
    'ethereum': ethereum,
    'mainnet': ethereum
  };
  return chains[chainName?.toLowerCase()] || polygon;
};

const urlParams = getUrlParams();
const selectedChain = getChainByName(urlParams.chain);

const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: process.env.VITE_THIRDWEB_FACTORY_ADDRESS,
      chain: selectedChain, // Dynamic chain from URL
      gasless: true,
      sponsorGas: true,
    }
  })
];
```

### 2. Authorization Logic
- **AutoConnect attempts connection** for 15 seconds
- **If successful**: User has existing unicorn.eth wallet → Access granted
- **If timeout**: User doesn't have existing wallet → Access denied
- **No manual connect needed**: Everything happens automatically

### 3. User Experience
1. User visits the dapp
2. AutoConnect automatically tries to connect existing wallet
3. If wallet exists: Immediate access with wallet info displayed
4. If no wallet: Clear message directing them to polygon.ac

## 🎯 Use Cases

This pattern is perfect for:
- **Exclusive community dapps** for existing polygon.ac members
- **Loyalty programs** for users with established smart wallets
- **Private beta testing** with pre-approved wallet holders
- **Membership verification** without manual wallet connection

## 🔒 Security Features

- **Factory address validation**: Only wallets from the unicorn.eth factory can connect
- **No manual connection**: Prevents unauthorized wallet attempts
- **Automatic timeout**: Clean failure state for unauthorized users
- **Gasless transactions**: Sponsored transactions for authorized users

## 🛠 Customization

### Change Authorization Logic
```javascript
// In useEffect where authorization happens
if (account) {
  // Add additional checks here
  const isAuthorized = true; // Your custom logic
  setConnectionState(isAuthorized ? "authorized" : "unauthorized");
}
```

### Customize UI States
```javascript
// Modify the UI components for different states:
// - connectionState === "checking" (loading)
// - connectionState === "unauthorized" (access denied)  
// - connectionState === "authorized" (success)
```

### Add Contract Interactions
```javascript
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";

// Add contract calls for authorized users
const contract = getContract({
  client,
  chain: polygon,
  address: "your_contract_address",
});
```

## 📚 Resources

- [Thirdweb AutoConnect Docs](https://portal.thirdweb.com/typescript/v5/react/components/AutoConnect)
- [Smart Accounts Guide](https://portal.thirdweb.com/typescript/v5/account-abstraction)
- [Polygon.ac Community](https://polygon.ac/)

## ⚡ Deployment

This example can be deployed to any static hosting provider:

- **Vercel**: Connect your GitHub repo
- **Netlify**: Drag and drop the `dist` folder after `npm run build`
- **GitHub Pages**: Use GitHub Actions for automatic deployment

Make sure to set your environment variables in your hosting provider's dashboard!

---

**Built for the unicorn.eth community with ❤️**