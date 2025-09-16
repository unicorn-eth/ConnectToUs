// Coded lovingly by @cryptowampum and Claude AI
// hooks/useUnicornDetection.js
import { useState, useEffect, useCallback } from 'react';

export const useUnicornDetection = () => {
  const [isUnicornEnvironment, setIsUnicornEnvironment] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [unicornParams, setUnicornParams] = useState(null);
  const [detectionMethod, setDetectionMethod] = useState(null);

  // Method 1: Check URL parameters
  const checkUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const walletId = urlParams.get('walletId');
    const authCookie = urlParams.get('authCookie');
    
    if (walletId === 'inApp' || authCookie) {
      setUnicornParams({ walletId, authCookie });
      return 'url_params';
    }
    return null;
  }, []);

  // Method 2: Check iframe and referrer
  const checkIframeContext = useCallback(() => {
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      try {
        const referrer = document.referrer;
        const unicornDomains = [
          'myunicornaccount.com',
          'unicorn.eth',
          'admin.myunicornaccount.com',
        ];
        
        const isUnicornReferrer = unicornDomains.some(domain => 
          referrer.includes(domain)
        );
        
        if (isUnicornReferrer) {
          return 'iframe_referrer';
        }
      } catch (e) {
        console.log('Could not check referrer:', e);
      }
    }
    
    return null;
  }, []);

  // Method 3: PostMessage communication with parent
  const checkPostMessage = useCallback(() => {
    return new Promise((resolve) => {
      // Only try if in iframe
      if (window.self === window.top) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 500); // Short timeout to not delay detection

      const handleMessage = (event) => {
        // Verify message is from trusted source
        const trustedOrigins = [
          'https://admin.myunicornaccount.com',
          'https://app.unicorn.eth',
        ];
        
        // In development, allow any origin
        const isDev = window.location.hostname === 'localhost';
        
        if (isDev || trustedOrigins.some(origin => event.origin === origin)) {
          if (event.data?.type === 'UNICORN_PORTAL_CONFIRM') {
            clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            resolve('postmessage');
          }
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Send ping to parent
      try {
        window.parent.postMessage({
          type: 'UNICORN_PORTAL_PING',
          timestamp: Date.now(),
          source: 'unicorn-dapp'
        }, '*');
      } catch (e) {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        resolve(null);
      }
    });
  }, []);

  // Method 4: Check localStorage for previous Unicorn connections
  const checkLocalStorage = useCallback(() => {
    try {
      const unicornHint = localStorage.getItem('unicorn_connected');
      const lastConnection = localStorage.getItem('last_wallet_connection');
      const connectionTime = localStorage.getItem('unicorn_connection_time');
      
      // Only consider recent connections (within 7 days)
      if (connectionTime) {
        const daysSinceConnection = (Date.now() - new Date(connectionTime).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceConnection > 7) {
          // Clear old connection data
          localStorage.removeItem('unicorn_connected');
          localStorage.removeItem('last_wallet_connection');
          localStorage.removeItem('unicorn_connection_time');
          return null;
        }
      }
      
      if (unicornHint === 'true' || lastConnection === 'unicorn') {
        return 'localstorage';
      }
    } catch (e) {
      // localStorage might be blocked
      console.debug('localStorage not available:', e);
    }
    return null;
  }, []);

  // Combined detection logic
  const detectEnvironment = useCallback(async () => {
    setDetectionComplete(false);
    
    console.log('🔍 Detecting Unicorn environment...');
    
    // Try methods in order of reliability
    const methods = [
      { name: 'URL Parameters', check: checkUrlParams },
      { name: 'Iframe Context', check: checkIframeContext },
      { name: 'Local Storage', check: checkLocalStorage },
      { name: 'PostMessage', check: checkPostMessage },
    ];

    for (const method of methods) {
      console.log(`Checking ${method.name}...`);
      
      const result = method.name === 'PostMessage' ? 
        await method.check() : 
        method.check();
      
      if (result) {
        console.log(`✅ Unicorn environment detected via ${method.name}`);
        setIsUnicornEnvironment(true);
        setDetectionMethod(result);
        setDetectionComplete(true);
        
        // Store detection for future use
        try {
          sessionStorage.setItem('unicorn_env_detected', 'true');
          sessionStorage.setItem('unicorn_detection_method', result);
        } catch (e) {
          // sessionStorage might be blocked
        }
        
        return true;
      }
    }

    console.log('ℹ️ Standard environment detected (not in Unicorn portal)');
    setIsUnicornEnvironment(false);
    setDetectionComplete(true);
    return false;
  }, [checkUrlParams, checkIframeContext, checkLocalStorage, checkPostMessage]);

  // Run detection on mount
  useEffect(() => {
    // Check if we already detected in this session
    try {
      const sessionDetected = sessionStorage.getItem('unicorn_env_detected');
      const sessionMethod = sessionStorage.getItem('unicorn_detection_method');
      
      if (sessionDetected === 'true' && sessionMethod) {
        setIsUnicornEnvironment(true);
        setDetectionMethod(sessionMethod);
        setDetectionComplete(true);
        console.log('Using cached detection from session:', sessionMethod);
        return;
      }
    } catch (e) {
      // sessionStorage might be blocked
    }
    
    // Otherwise, run full detection
    detectEnvironment();
  }, [detectEnvironment]);

  // Helper to manually set Unicorn environment (useful for testing)
  const forceUnicornMode = useCallback((enabled) => {
    setIsUnicornEnvironment(enabled);
    setDetectionComplete(true);
    setDetectionMethod('forced');
    
    console.log(`🔧 Manually ${enabled ? 'enabled' : 'disabled'} Unicorn mode`);
    
    try {
      if (enabled) {
        localStorage.setItem('unicorn_connected', 'true');
        sessionStorage.setItem('unicorn_env_detected', 'true');
        sessionStorage.setItem('unicorn_detection_method', 'forced');
      } else {
        localStorage.removeItem('unicorn_connected');
        sessionStorage.removeItem('unicorn_env_detected');
        sessionStorage.removeItem('unicorn_detection_method');
      }
    } catch (e) {
      // Storage might be blocked
    }
  }, []);

  // Helper to get Unicorn connection URL for testing
  const getUnicornUrl = useCallback(() => {
    if (unicornParams?.walletId && unicornParams?.authCookie) {
      return `?walletId=${unicornParams.walletId}&authCookie=${unicornParams.authCookie}`;
    }
    // Return test parameters for development
    if (process.env.NODE_ENV === 'development') {
      return '?walletId=inApp&authCookie=test_auth_cookie';
    }
    return '';
  }, [unicornParams]);

  // Debug information
  const getDebugInfo = useCallback(() => {
    return {
      isUnicornEnvironment,
      detectionComplete,
      detectionMethod,
      unicornParams,
      isInIframe: window.self !== window.top,
      referrer: document.referrer || 'none',
      urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      timestamp: new Date().toISOString(),
    };
  }, [isUnicornEnvironment, detectionComplete, detectionMethod, unicornParams]);

  return {
    isUnicornEnvironment,
    detectionComplete,
    detectionMethod,
    unicornParams,
    forceUnicornMode,
    getUnicornUrl,
    redetect: detectEnvironment,
    getDebugInfo,
  };
};

// Standalone function to check Unicorn environment (for use outside React)
export const isUnicornEnvironment = () => {
  // Quick synchronous check
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('walletId') === 'inApp' || urlParams.get('authCookie')) {
    return true;
  }
  
  // Check iframe
  if (window.self !== window.top) {
    const referrer = document.referrer;
    const unicornDomains = ['myunicornaccount.com', 'unicorn.eth'];
    return unicornDomains.some(domain => referrer.includes(domain));
  }
  
  return false;
};