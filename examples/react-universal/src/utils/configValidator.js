// src/utils/configValidator.js - Configuration validation utility
// Coded lovingly by @cryptowampum and Claude AI

import { validateConfig, getSupportedChains } from '../config/thirdweb';

export class ConfigValidator {
  static validate() {
    const validation = validateConfig();
    return validation;
  }

  static validateEnvironment() {
    const issues = [];
    const warnings = [];
    
    // Required environment variables
    const required = [
      'VITE_THIRDWEB_CLIENT_ID',
      'VITE_THIRDWEB_FACTORY_ADDRESS',
    ];
    
    // Optional but recommended
    const recommended = [
      'VITE_WALLETCONNECT_PROJECT_ID',
      'VITE_ALCHEMY_ID',
      'VITE_APP_NAME',
    ];
    
    // Check required variables
    required.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        issues.push(`Missing required environment variable: ${envVar}`);
      }
    });
    
    // Check recommended variables
    recommended.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        warnings.push(`Missing recommended environment variable: ${envVar}`);
      }
    });
    
    // Validate specific formats
    if (import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS && 
        !import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS.startsWith('0x')) {
      issues.push('VITE_THIRDWEB_FACTORY_ADDRESS must be a valid Ethereum address starting with 0x');
    }
    
    if (import.meta.env.VITE_THIRDWEB_CLIENT_ID && 
        import.meta.env.VITE_THIRDWEB_CLIENT_ID.length < 10) {
      warnings.push('VITE_THIRDWEB_CLIENT_ID seems too short, verify it\'s correct');
    }
    
    // Validate chain
    const defaultChain = import.meta.env.VITE_DEFAULT_CHAIN || 'base';
    const supportedChains = getSupportedChains().map(c => c.name);
    
    if (!supportedChains.includes(defaultChain)) {
      issues.push(`VITE_DEFAULT_CHAIN "${defaultChain}" is not supported. Supported: ${supportedChains.join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      summary: {
        required: required.length,
        configured: required.filter(env => import.meta.env[env]).length,
        recommended: recommended.length,
        recommendedConfigured: recommended.filter(env => import.meta.env[env]).length,
      }
    };
  }

  static printReport() {
    const thirdwebValidation = this.validate();
    const envValidation = this.validateEnvironment();
    
    console.group('🔧 Configuration Validation Report');
    
    // Thirdweb validation
    if (thirdwebValidation.isValid) {
      console.log('✅ Thirdweb configuration: Valid');
    } else {
      console.error('❌ Thirdweb configuration issues:', thirdwebValidation.issues);
    }
    
    // Environment validation
    if (envValidation.isValid) {
      console.log('✅ Environment variables: Valid');
    } else {
      console.error('❌ Environment issues:', envValidation.issues);
    }
    
    if (envValidation.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', envValidation.warnings);
    }
    
    // Summary
    console.log('📊 Summary:', {
      'Required vars': `${envValidation.summary.configured}/${envValidation.summary.required}`,
      'Recommended vars': `${envValidation.summary.recommendedConfigured}/${envValidation.summary.recommended}`,
      'Overall status': thirdwebValidation.isValid && envValidation.isValid ? 'Ready' : 'Needs attention'
    });
    
    console.groupEnd();
    
    return {
      thirdweb: thirdwebValidation,
      environment: envValidation,
      overall: thirdwebValidation.isValid && envValidation.isValid
    };
  }

  static getQuickFixSuggestions() {
    const envValidation = this.validateEnvironment();
    const suggestions = [];
    
    if (!import.meta.env.VITE_THIRDWEB_CLIENT_ID) {
      suggestions.push({
        issue: 'Missing Thirdweb Client ID',
        fix: 'Get your client ID from https://thirdweb.com/dashboard and add VITE_THIRDWEB_CLIENT_ID to your .env file'
      });
    }
    
    if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
      suggestions.push({
        issue: 'Missing WalletConnect Project ID',
        fix: 'Get your project ID from https://cloud.walletconnect.com and add VITE_WALLETCONNECT_PROJECT_ID to your .env file'
      });
    }
    
    if (!import.meta.env.VITE_ALCHEMY_ID) {
      suggestions.push({
        issue: 'No Alchemy ID configured',
        fix: 'For better RPC performance, get an API key from https://alchemy.com and add VITE_ALCHEMY_ID to your .env file'
      });
    }
    
    return suggestions;
  }
}

// Auto-run validation in development
if (import.meta.env.DEV) {
  const report = ConfigValidator.printReport();
  
  if (!report.overall) {
    console.group('🛠️ Quick Fix Suggestions');
    const suggestions = ConfigValidator.getQuickFixSuggestions();
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.issue}`);
      console.log(`   → ${suggestion.fix}`);
    });
    console.groupEnd();
  }
}

export default ConfigValidator;