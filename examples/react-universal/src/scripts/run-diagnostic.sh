#!/bin/bash

# run-diagnostic.sh - Diagnose and fix common setup issues
# Usage: bash run-diagnostic.sh

echo "🔧 Universal Wallet dApp - Diagnostic Tool"
echo "=========================================="
echo ""

# Check Node version
echo "📌 Checking Node.js version..."
node_version=$(node -v)
echo "   Node version: $node_version"

# Check npm version  
npm_version=$(npm -v)
echo "   NPM version: $npm_version"
echo ""

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
echo ""

# Check if key files exist
echo "📋 Checking essential files..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json found"
else
    echo "   ❌ package.json NOT FOUND"
    echo "   👉 Make sure you're in the project root directory"
    exit 1
fi

if [ -f "index.html" ]; then
    echo "   ✅ index.html found"
else
    echo "   ❌ index.html NOT FOUND in root"
    echo "   👉 index.html must be in the root directory (not in src/)"
fi

if [ -f "src/main.jsx" ]; then
    echo "   ✅ src/main.jsx found"
else
    echo "   ❌ src/main.jsx NOT FOUND"
fi

if [ -f "src/App.jsx" ]; then
    echo "   ✅ src/App.jsx found"
else
    echo "   ❌ src/App.jsx NOT FOUND"
fi
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules NOT FOUND"
    echo "   👉 Running: npm install"
    npm install
fi
echo ""

# Check for .env file
echo "🔐 Checking environment setup..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "your_walletconnect_project_id_here" .env; then
        echo "   ⚠️  WARNING: Please update VITE_WALLETCONNECT_PROJECT_ID in .env"
    fi
else
    echo "   ⚠️  .env file not found"
    if [ -f ".env.example" ]; then
        echo "   👉 Creating .env from .env.example"
        cp .env.example .env
        echo "   ✅ .env created - Please edit it with your values"
    fi
fi
echo ""

# Try to start the dev server
echo "🚀 Attempting to start development server..."
echo "   Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use"
    echo "   Using port 3001 instead..."
    npm run dev -- --port 3001
else
    npm run dev
fi