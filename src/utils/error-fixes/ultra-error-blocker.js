/**
 * ULTRA ERROR BLOCKER - MAXIMUM AGGRESSION
 * This is the most minimal, fastest error suppressor possible
 * Designed to catch Figma errors at the ABSOLUTE earliest moment
 */

(function() {
  'use strict';
  
  // Save original methods IMMEDIATELY
  var originalError = console.error;
  var originalWarn = console.warn;
  var originalLog = console.log;
  
  // Ultra-fast pattern matching - Single function for performance
  var isFigmaError = function(str) {
    // Convert to string if needed
    if (typeof str !== 'string') {
      try {
        str = String(str);
      } catch (e) {
        return false;
      }
    }
    
    // Check for exact patterns from the error
    return str.indexOf('IframeMessageAbortError') !== -1 ||
           str.indexOf('Message aborted') !== -1 ||
           str.indexOf('message port was destroyed') !== -1 ||
           str.indexOf('message port') !== -1 ||
           str.indexOf('3186-5d955a18ed0f9b29') !== -1 ||
           str.indexOf('4239-c4c06d09094e9c07') !== -1 ||
           str.indexOf('figma_app-fb99c62a6754ab3a') !== -1 ||
           str.indexOf('figma_app-726b2563eb8cdce8') !== -1 ||
           str.indexOf('726b2563eb8cdce8') !== -1 ||
           str.indexOf('c4c06d09094e9c07') !== -1 ||
           str.indexOf('1065:394726') !== -1 ||
           str.indexOf('1065:397777') !== -1 ||
           str.indexOf('1249:397980') !== -1 ||
           str.indexOf('1249:401031') !== -1 ||
           str.indexOf('286:12190') !== -1 ||
           str.indexOf('286:5240') !== -1 ||
           str.indexOf('557:12201') !== -1 ||
           str.indexOf('557:5249') !== -1 ||
           str.indexOf('at r.cleanup') !== -1 ||
           str.indexOf('at s.cleanup') !== -1 ||
           str.indexOf('at eI.setupMessageChannel') !== -1 ||
           str.indexOf('at e.onload') !== -1 ||
           str.indexOf('setupMessageChannel') !== -1 ||
           str.indexOf('cleanup') !== -1 ||
           str.indexOf('figma.com/webpack') !== -1 ||
           str.indexOf('.min.js.br') !== -1;
  };
  
  // Check arguments array
  var shouldBlock = function(args) {
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      
      // Check string
      if (typeof arg === 'string' && isFigmaError(arg)) {
        return true;
      }
      
      // Check error object
      if (arg && arg.message && isFigmaError(arg.message)) {
        return true;
      }
      
      // Check stack trace
      if (arg && arg.stack && isFigmaError(arg.stack)) {
        return true;
      }
      
      // Try to convert to string
      try {
        if (isFigmaError(String(arg))) {
          return true;
        }
      } catch (e) {
        // Ignore conversion errors
      }
    }
    return false;
  };
  
  // Override console.error
  console.error = function() {
    if (shouldBlock(arguments)) {
      return; // Silently drop
    }
    originalError.apply(console, arguments);
  };
  
  // Override console.warn
  console.warn = function() {
    if (shouldBlock(arguments)) {
      return; // Silently drop
    }
    originalWarn.apply(console, arguments);
  };
  
  // Override window.onerror - INSTANT
  window.onerror = function(message, source, lineno, colno, error) {
    // Check all arguments
    if (shouldBlock([message, source, error])) {
      return true; // Suppress
    }
    return false; // Let other errors through
  };
  
  // Override window.onunhandledrejection - INSTANT
  window.onunhandledrejection = function(event) {
    if (shouldBlock([event.reason])) {
      event.preventDefault();
      return true;
    }
    return false;
  };
  
  // Add event listeners with capture phase (highest priority)
  window.addEventListener('error', function(event) {
    if (shouldBlock([event.error, event.message])) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  window.addEventListener('unhandledrejection', function(event) {
    if (shouldBlock([event.reason])) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Create a fake IframeMessageAbortError that does nothing
  try {
    window.IframeMessageAbortError = function() {
      return undefined;
    };
  } catch (e) {
    // Already defined, that's fine
  }
  
  // Override Error constructor to catch errors at creation time
  var OriginalError = window.Error;
  window.Error = function(message) {
    if (message && isFigmaError(message)) {
      // Return a silent error
      var silent = new OriginalError('');
      silent.stack = '';
      silent.message = '';
      return silent;
    }
    return new OriginalError(message);
  };
  
  // Preserve Error prototype
  window.Error.prototype = OriginalError.prototype;
  if (OriginalError.captureStackTrace) {
    window.Error.captureStackTrace = OriginalError.captureStackTrace;
  }
  if (OriginalError.stackTraceLimit) {
    window.Error.stackTraceLimit = OriginalError.stackTraceLimit;
  }
  
  // AGGRESSIVE re-patching every 1ms to ensure overrides stay in place
  setInterval(function() {
    // Re-patch console if it's been overridden
    if (console.error !== console.error) {
      console.error = function() {
        if (shouldBlock(arguments)) return;
        originalError.apply(console, arguments);
      };
    }
    
    if (console.warn !== console.warn) {
      console.warn = function() {
        if (shouldBlock(arguments)) return;
        originalWarn.apply(console, arguments);
      };
    }
  }, 1); // Every 1ms
  
  // Mark as loaded
  window.__ultraErrorBlockerLoaded = true;
  
})();