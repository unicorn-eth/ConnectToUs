# 🔴 Debug Guide: Server Starts But No Page Loads

## Quick Diagnosis

Run these commands to diagnose the issue:

```bash
# 1. Check what files Vite sees
ls -la
ls -la src/

# 2. Check if server is actually running
curl http://localhost:3000

# 3. Check Vite is serving files
curl http://localhost:3000/src/main.jsx
```

## Common Issues & Solutions

### Issue 1: Wrong File Locations

**THE MOST COMMON ISSUE!**

```
CORRECT Structure:
react-universal/
├── index.html          ← MUST be here (root)
├── package.json        ← Root
├── vite.config.js      ← Root
└── src/
    ├── main.jsx        ← Entry point here
    ├── App.jsx         ← App component
    └── ...

WRONG Structure:
react-universal/
└── src/
    ├── index.html      ← WRONG! Move to root
    └── ...
```

**Fix:**
```bash
# If index.html is in src/, move it to root
mv src/index.html ./index.html
```

### Issue 2: Missing Entry Point

Check if `src/main.jsx` exists and has content:

```bash
cat src/main.jsx
```

If missing or empty, create it:

```bash
# Create minimal main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => <h1>Test App Working!</h1>;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
EOF
```

### Issue 3: Import Errors

Check browser console (F12) for errors like:
- `Failed to resolve import`
- `Module not found`
- `Cannot read properties of undefined`

**Common import fixes:**

```javascript
// WRONG - if App.css doesn't exist
import './App.css';  

// FIX - Remove or create the file
// Either remove the import or create an empty App.css
```

```javascript
// WRONG - incorrect paths
import App from 'App';

// CORRECT - relative paths
import App from './App';
```

### Issue 4: Port Issues

Check if Vite is actually running on port 3000:

```bash
# Check what's on port 3000
lsof -i :3000

# Or try different port
npm run dev -- --port 3001
```

### Issue 5: Vite Not Serving

Test if Vite is serving anything:

```bash
# Should return HTML
curl -I http://localhost:3000

# Check Vite's output
npm run dev -- --debug
```

## Step-by-Step Debug Process

### Step 1: Use Test Files

1. **Rename current files (backup)**
```bash
mv index.html index.html.backup
mv src/App.jsx src/App.jsx.backup
```

2. **Use test index.html**
```bash
# Copy the test HTML (from index-test.html artifact)
# Save as index.html in root
```

3. **Use minimal App**
```bash
# Copy the minimal App (from App-minimal.jsx artifact)
# Save as src/App.jsx
```

4. **Test it works**
```bash
npm run dev
```

If this works, gradually add back complexity.

### Step 2: Check Browser Console

1. Open http://localhost:3000
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for red errors
5. Go to Network tab
6. Refresh page
7. Check for failed requests (red)

### Step 3: Check Vite Output

```bash
# Run with verbose output
VITE_LOG_LEVEL=info npm run dev

# or
npm run dev -- --logLevel info --debug
```

### Step 4: Test with Simple HTML

Create `test.html` in root:

```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>If you see this, Vite is working!</h1>
</body>
</html>
```

Visit: http://localhost:3000/test.html

### Step 5: Check Node Modules

```bash
# Reinstall everything
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check for peer dependency warnings
npm ls
```

## Manual Test Server

If Vite won't work, test with a simple server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:3000
```

## Logs to Share

If still not working, share these:

1. **Terminal output:**
```bash
npm run dev 2>&1 | tee vite.log
# Share vite.log content
```

2. **File structure:**
```bash
find . -type f -name "*.jsx" -o -name "*.js" -o -name "*.html" | grep -v node_modules
```

3. **Package versions:**
```bash
npm ls --depth=0
```

4. **Browser console:**
- Screenshot of F12 → Console tab
- Screenshot of F12 → Network tab

## Emergency Fallback

If nothing works, try the CDN version (no build step):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Unicorn dApp</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script>
    const e = React.createElement;
    const App = () => e('h1', null, '🦄 Unicorn dApp Works!');
    ReactDOM.createRoot(document.getElementById('root')).render(e(App));
  </script>
</body>
</html>
```

Save as `index.html` and open directly in browser.

## Still Not Working?

Share this exact information:
1. Your OS (Windows/Mac/Linux)
2. Node version: `node -v`
3. NPM version: `npm -v`  
4. Exact terminal output when running `npm run dev`
5. What URL you're visiting
6. What you see (blank? error? loading?)
7. Browser console errors (F12)
8. Network tab status (F12)