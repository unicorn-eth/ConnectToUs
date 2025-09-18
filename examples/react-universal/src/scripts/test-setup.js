#!/usr/bin/env node

// test-setup.js - Run this to verify your setup is correct
// Usage: node test-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Universal Wallet dApp Setup...\n');

const requiredFiles = {
  'index.html': 'Root HTML file',
  'package.json': 'Package configuration',
  'vite.config.js': 'Vite configuration',
  'src/main.jsx': 'React entry point',
  'src/App.jsx': 'Main App component',
  'src/index.css': 'Global styles',
  'src/App.css': 'App styles',
  'src/components/UnicornAutoConnect.jsx': 'Unicorn AutoConnect component',
  'src/components/TransactionDemo.jsx': 'Transaction demo component',
  'src/components/WalletInfo.jsx': 'Wallet info component',
  'src/hooks/useUnicornDetection.js': 'Unicorn detection hook',
  'src/config/wagmi.js': 'Wagmi configuration',
};

let allGood = true;

// Check required files
console.log('📁 Checking required files:\n');
for (const [file, description] of Object.entries(requiredFiles)) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - ${description}`);
  } else {
    console.log(`❌ ${file} - MISSING! (${description})`);
    allGood = false;
  }
}

// Check node_modules
console.log('\n📦 Checking dependencies:\n');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules exists');
  
  // Check key dependencies
  const keyDeps = ['react', 'react-dom', 'wagmi', 'thirdweb', '@rainbow-me/rainbowkit'];
  for (const dep of keyDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`  ✅ ${dep} installed`);
    } else {
      console.log(`  ❌ ${dep} NOT installed`);
      allGood = false;
    }
  }
} else {
  console.log('❌ node_modules NOT found - run: npm install');
  allGood = false;
}

// Check .env file
console.log('\n🔐 Checking environment:\n');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_WALLETCONNECT_PROJECT_ID=your_')) {
    console.log('⚠️  WARNING: Update VITE_WALLETCONNECT_PROJECT_ID in .env');
  }
} else {
  console.log('⚠️  .env file NOT found - copy from .env.example');
  console.log('   Run: cp .env.example .env');
}

// Check package.json scripts
console.log('\n📜 Checking package.json scripts:\n');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'preview'];
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script "${script}" found`);
    } else {
      console.log(`❌ Script "${script}" missing`);
      allGood = false;
    }
  }
} catch (error) {
  console.log('❌ Could not read package.json');
  allGood = false;
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('\n✅ Setup looks good! You can run:');
  console.log('   npm run dev\n');
} else {
  console.log('\n❌ Setup issues found. Please fix the above issues.');
  console.log('\nQuick fixes:');
  console.log('1. Make sure all files are copied from artifacts');
  console.log('2. Run: npm install');
  console.log('3. Copy .env: cp .env.example .env');
  console.log('4. Edit .env and add your WalletConnect Project ID\n');
}

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
  console.log(`\n⚠️  WARNING: Node.js ${nodeVersion} detected. Recommend v16 or higher.`);
}