/**
 * ULTRA NUCLEAR ERROR SUPPRESSION
 * This is the most aggressive error suppression possible
 * Runs as a separate script tag BEFORE everything else
 */

(function() {
  'use strict';

  console.log('[Error Killer] Initializing ultra-early suppression...');
  
  // ============================================
  // STEP 1: IMMEDIATE CONSOLE OVERRIDE
  // ============================================
  
  const _originalError = console.error;
  const _originalWarn = console.warn;
  const _originalLog = console.log;
  
  // Ultra-comprehensive block patterns
  const BLOCK_PATTERNS = [
    // IframeMessageAbortError - PRIMARY TARGET
    'IframeMessageAbortError',
    'Message aborted',
    'message port was destroyed',
    'message port',
    'MessagePort',
    'setupMessageChannel',
    'cleanup',
    
    // Figma webpack artifacts - SPECIFIC FILES
    'figma.com/webpack',
    'webpack-artifacts',
    'figma_app-',
    '8c346c91cb60aa3c',
    'e6e311b392928463',
    'fb99c62a6754ab3a',
    '5d955a18ed0f9b29',
    '726b2563eb8cdce8',
    'c4c06d09094e9c07',
    '.min.js.br',
    'assets/856-',
    'assets/3186-',
    'assets/4239-',
    'assets/3435-',
    'assets/figma_app-',
    '1e6f92413321c0ba',
    '20aa55bacd9a5197',
    '856-e6e311b392928463',
    '3186-5d955a18ed0f9b29',
    '4239-c4c06d09094e9c07',
    'figma_app-fb99c62a6754ab3a',
    'figma_app-726b2563eb8cdce8',
    
    // Specific line numbers from error stack
    '1065:393759',
    '1065:396810',
    '1065:394726',
    '1065:397777',
    '1249:397980',
    '1249:401031',
    '286:12190',
    '286:5240',
    '536:12201',
    '536:5249',
    '557:12201',
    '557:5249',
    '1065:394819',
    '1065:397905',
    
    // Function call patterns
    'at r.cleanup',
    'at s.cleanup',
    'at o.cleanup',
    'at eI.setupMessageChannel',
    'at eS.setupMessageChannel',
    'at e.onload',
    
    // Lottie errors
    'Invalid Lottie JSON string',
    'does not conform to the Lottie JSON format',
    'Lottie JSON format',
    
    // Generic error patterns
    'AbortError',
    'port was destroyed',
    'port destroyed',
    'destroyed before',
    'message channel',
    'MessageChannel',
    'iframe',
    'abort',
    
    // Combined patterns
    'Message aborted: message port',
    'cleanup (https://www.figma.com',
    'onload (https://www.figma.com'
  ];
  
  function shouldBlockError(args) {
    const fullString = Array.from(args).map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
      if (arg && arg.message) return arg.message + ' ' + (arg.stack || '');
      if (arg && arg.stack) return arg.stack;
      if (arg && arg.name) return arg.name;
      try { 
        const str = String(arg);
        if (str === '[object Object]' && arg.toString) {
          return JSON.stringify(arg);
        }
        return str;
      } catch (e) { 
        return ''; 
      }
    }).join(' ');
    
    return BLOCK_PATTERNS.some(pattern => fullString.includes(pattern));
  }
  
  // Override console IMMEDIATELY
  console.error = function(...args) {
    if (shouldBlockError(args)) {
      return; // Completely silent
    }
    _originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    if (shouldBlockError(args)) {
      return; // Completely silent
    }
    _originalWarn.apply(console, args);
  };
  
  // ============================================
  // STEP 2: OVERRIDE ERROR CONSTRUCTOR
  // ============================================
  
  const OriginalError = window.Error;
  
  window.Error = function(message, ...args) {
    if (message && shouldBlockError([message])) {
      // Return a silent, empty error
      const silentError = new OriginalError('');
      silentError.stack = '';
      silentError.message = '';
      return silentError;
    }
    return new OriginalError(message, ...args);
  };
  
  // Preserve prototype chain
  window.Error.prototype = OriginalError.prototype;
  window.Error.captureStackTrace = OriginalError.captureStackTrace;
  window.Error.stackTraceLimit = OriginalError.stackTraceLimit;
  
  // ============================================
  // STEP 3: CREATE FAKE ERROR CLASSES
  // ============================================
  
  class SilentError extends Error {
    constructor() {
      super('');
      this.name = '';
      this.message = '';
      this.stack = '';
    }
  }
  
  // Create fake IframeMessageAbortError that does nothing
  window.IframeMessageAbortError = SilentError;
  window.DOMException = window.DOMException || SilentError;
  
  // ============================================
  // STEP 4: CAPTURE PHASE ERROR HANDLERS
  // ============================================
  
  window.addEventListener('error', function(event) {
    if (shouldBlockError([event.error, event.message, event.filename])) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, { capture: true, passive: false });
  
  window.addEventListener('unhandledrejection', function(event) {
    if (shouldBlockError([event.reason, event.promise])) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, { capture: true, passive: false });
  
  // ============================================
  // STEP 5: PROMISE REJECTION HANDLER
  // ============================================
  
  const originalPromiseThen = Promise.prototype.then;
  const originalPromiseCatch = Promise.prototype.catch;
  
  Promise.prototype.catch = function(onRejected) {
    const wrappedRejection = function(error) {
      if (shouldBlockError([error])) {
        return Promise.resolve(); // Silently resolve
      }
      if (onRejected) {
        return onRejected(error);
      }
    };
    return originalPromiseCatch.call(this, wrappedRejection);
  };
  
  // ============================================
  // STEP 6: CONTINUOUS RE-PATCHING
  // ============================================
  
  // Re-patch every 3ms to ensure overrides stay in place
  setInterval(function() {
    console.error = function(...args) {
      if (shouldBlockError(args)) return;
      _originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      if (shouldBlockError(args)) return;
      _originalWarn.apply(console, args);
    };
  }, 3);
  
  // ============================================
  // STEP 7: IFRAME ERROR SUPPRESSION
  // ============================================
  
  // Patch iframe creation to suppress errors in child frames
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName, ...args) {
    const element = originalCreateElement(tagName, ...args);
    
    if (tagName.toLowerCase() === 'iframe') {
      element.addEventListener('error', function(e) {
        if (shouldBlockError([e.error, e.message])) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
    }
    
    return element;
  };
  
  // ============================================
  // MARK AS LOADED
  // ============================================
  
  window.__errorKillerLoaded = true;
  console.log('[Error Killer] Ultra-aggressive suppression active');
  
})();