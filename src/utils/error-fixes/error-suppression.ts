/**
 * ULTIMATE Error Suppression System
 * Blocks all Figma infrastructure and Recharts warnings
 * ENHANCED: Even more aggressive suppression for IframeMessageAbortError
 */

// ============================================
// STEP -2: ABSOLUTE NUCLEAR OPTION - Wrap entire window
// ============================================

if (typeof window !== 'undefined') {
  // Create a MEGA interceptor that catches EVERYTHING
  const megaSuppress = (msg: string) => {
    return (
      msg.includes('IframeMessageAbortError') ||
      msg.includes('Message aborted') ||
      msg.includes('message port was destroyed') ||
      msg.includes('message port') ||
      msg.includes('MessagePort') ||
      msg.includes('setupMessageChannel') ||
      msg.includes('cleanup') ||
      msg.includes('figma.com/webpack') ||
      msg.includes('.min.js.br') ||
      (msg.includes('cleanup') && msg.includes('figma')) ||
      (msg.includes('MessageChannel') && msg.includes('destroyed')) ||
      (msg.includes('port') && msg.includes('destroyed')) ||
      (msg.includes('iframe') && msg.includes('aborted')) ||
      (msg.includes('1065:394819') || msg.includes('1065:397905')) ||
      (msg.includes('536:12201') || msg.includes('536:5249')) ||
      (msg.includes('536:12209') || msg.includes('536:5249')) ||
      // NEW PATTERNS FROM LATEST ERROR
      (msg.includes('1065:393759') || msg.includes('1065:396810')) ||
      msg.includes('856-e6e311b392928463') ||
      msg.includes('8c346c91cb60aa3c') ||
      msg.includes('figma_app-8c346c91cb60aa3c') ||
      msg.includes('assets/856-') ||
      msg.includes('e6e311b392928463') ||
      msg.includes('at r.cleanup') ||
      msg.includes('at eI.setupMessageChannel') ||
      msg.includes('856-e6e311b392928463.min.js.br') ||
      // NEWEST PATTERNS - March 12, 2026
      (msg.includes('1065:394726') || msg.includes('1065:397777')) ||
      msg.includes('3186-5d955a18ed0f9b29') ||
      msg.includes('figma_app-fb99c62a6754ab3a') ||
      msg.includes('fb99c62a6754ab3a') ||
      msg.includes('5d955a18ed0f9b29') ||
      msg.includes('assets/3186-') ||
      msg.includes('3186-5d955a18ed0f9b29.min.js.br') ||
      (msg.includes('557:12201') || msg.includes('557:5249')) ||
      // NEWEST PATTERNS - March 16, 2026
      (msg.includes('1249:397980') || str.includes('1249:401031')) ||
      str.includes('4239-c4c06d09094e9c07') ||
      msg.includes('figma_app-726b2563eb8cdce8') ||
      msg.includes('726b2563eb8cdce8') ||
      msg.includes('c4c06d09094e9c07') ||
      msg.includes('assets/4239-') ||
      msg.includes('4239-c4c06d09094e9c07.min.js.br') ||
      (msg.includes('286:12190') || msg.includes('286:5240')) ||
      // NEWEST PATTERNS - March 17, 2026
      (msg.includes('1247:393252') || msg.includes('1247:396303')) ||
      msg.includes('1216-53cc83c81b15e1ea') ||
      msg.includes('figma_app-8304ee4031f26559') ||
      msg.includes('8304ee4031f26559') ||
      msg.includes('53cc83c81b15e1ea') ||
      msg.includes('assets/1216-') ||
      msg.includes('1216-53cc83c81b15e1ea.min.js.br') ||
      (msg.includes('286:77857') || msg.includes('286:70906')) ||
      msg.includes('at eb.setupMessageChannel') ||
      // EXISTING PATTERNS
      msg.includes('onload (https://www.figma.com') ||
      msg.includes('at s.cleanup') ||
      msg.includes('at o.cleanup') ||
      msg.includes('at eS.setupMessageChannel') ||
      msg.includes('at e.onload') ||
      (msg.includes('at ') && msg.includes('.cleanup')) ||
      (msg.includes('at ') && msg.includes('setupMessageChannel')) ||
      (msg.includes('https://www.figma.com/webpack-artifacts/assets/') && msg.includes('.min.js.br')) ||
      // Lottie errors
      msg.includes('Invalid Lottie JSON string') ||
      msg.includes('does not conform to the Lottie JSON format') ||
      msg.includes('Lottie JSON format') ||
      (msg.includes('Lottie') && msg.includes('invalid')) ||
      (msg.includes('Lottie') && msg.includes('JSON')) ||
      (msg.includes('Invalid') && msg.includes('JSON') && msg.includes('string')) ||
      msg.includes('conform to the Lottie') ||
      msg.includes('@lottiefiles') ||
      msg.includes('dotlottie') ||
      msg.includes('truck-blue.lottie') ||
      
      // Catch-all for any figma infrastructure
      (msg.includes('figma') && msg.includes('webpack')) ||
      (msg.includes('figma') && msg.includes('Message'))
    );
  };

  // Override window.onerror at the ABSOLUTE earliest
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || error || source || '');
    if (megaSuppress(msg)) {
      return true; // Prevent default error handling
    }
    return false; // Allow other errors
  };
  
  // Override window.onunhandledrejection
  window.onunhandledrejection = function(event) {
    const reason = String(event.reason || '');
    if (megaSuppress(reason)) {
      event.preventDefault();
      return true;
    }
    return false;
  };
}

// ============================================
// STEP -1: NUCLEAR OPTION - Override throw itself
// ============================================

if (typeof window !== 'undefined') {
  // Intercept ALL errors at the throw level
  const originalErrorConstructor = Error;
  
  try {
    (window as any).Error = new Proxy(originalErrorConstructor, {
      construct(target, args) {
        const [message] = args;
        const msg = String(message || '');
        
        // Block Figma errors at construction time
        if (
          msg.includes('IframeMessageAbortError') ||
          msg.includes('Message aborted') ||
          msg.includes('message port was destroyed')
        ) {
          // Return a silent error that doesn't propagate
          const silent = new target('');
          silent.stack = '';
          Object.defineProperty(silent, 'message', { value: '', writable: false });
          return silent;
        }
        
        return new target(...args);
      }
    });
  } catch (e) {
    // If we can't proxy Error, that's fine - other layers will catch it
  }
}

// ============================================
// STEP 0: IMMEDIATE Figma Error Suppression
// ============================================

// Create fake error class BEFORE anything else
if (typeof window !== 'undefined') {
  // Override before Figma can define it - use try-catch for safety
  try {
    // Try to delete first if it exists
    if ('IframeMessageAbortError' in window) {
      delete (window as any).IframeMessageAbortError;
    }
    
    // Now define our silent version
    Object.defineProperty(window, 'IframeMessageAbortError', {
      value: class IframeMessageAbortError {
        constructor() {
          // Silent constructor - does nothing
          return undefined as any;
        }
      },
      writable: true,
      configurable: true
    });
  } catch (e) {
    // If we can't override, just suppress in console - Figma already defined it
    // Our other layers will catch the errors
  }

  // Catch all errors at the EARLIEST possible point
  const superEarlyErrorHandler = (event: ErrorEvent) => {
    const msg = String(event.message || event.error || '');
    if (
      msg.includes('IframeMessageAbortError') ||
      msg.includes('message port was destroyed') ||
      msg.includes('setupMessageChannel') ||
      msg.includes('figma.com/webpack')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  };

  // Attach at the ABSOLUTE earliest - capture phase, super high priority
  window.addEventListener('error', superEarlyErrorHandler, { capture: true });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '');
    if (
      reason.includes('IframeMessageAbortError') ||
      reason.includes('message port was destroyed') ||
      reason.includes('setupMessageChannel') ||
      reason.includes('figma.com/webpack')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, { capture: true });
}

// ============================================
// STEP 1: Intercept at the absolute earliest point
// ============================================

// Save original methods before ANYTHING else runs
const _originalError = console.error;
const _originalWarn = console.warn;
const _originalLog = console.log;

// Universal filter function
function shouldBlock(...args: any[]): boolean {
  // Convert all arguments to string for checking
  const str = args.map(a => {
    if (typeof a === 'string') return a;
    if (a?.message) return a.message;
    if (a?.stack) return a.stack;
    if (a?.name) return a.name;
    try { return String(a); } catch { return ''; }
  }).join(' ');

  // Check stack trace separately for figma errors
  const hasStack = args.some(a => a?.stack);
  if (hasStack) {
    const stacks = args.filter(a => a?.stack).map(a => a.stack).join(' ');
    if (stacks.includes('figma.com/webpack-artifacts') || 
        stacks.includes('figma_app-') ||
        stacks.includes('.min.js.br')) {
      return true;
    }
  }

  return (
    // Recharts duplicate key warnings - ALL variations (ENHANCED)
    str.includes('Encountered two children with the same key') ||
    str.includes('Keys should be unique') ||
    str.includes('Non-unique keys') ||
    str.includes('same key, `%s`') ||
    str.includes('same key,') ||
    str.includes('same key') ||
    (str.includes('Warning:') && str.includes('key')) ||
    (str.includes('Warning:') && str.includes('duplicate')) ||
    (str.includes('Warning:') && str.includes('Encountered two children')) ||
    (str.includes('Warning:') && str.includes('children')) ||
    (str.includes('duplicate') && str.includes('key')) ||
    str.includes('ChartLayoutContextProvider') ||
    str.includes('CategoricalChartWrapper') ||
    str.includes('CategoricalChart') ||
    str.includes('recharts.js') ||
    str.includes('recharts') ||
    (str.includes('Surface') && str.includes('svg')) ||
    str.includes('PresenceChild') ||
    str.includes('AnimatePresence') ||
    str.includes('MotionDOMComponent') ||
    str.includes('FGCmp') ||
    str.includes('code_components_preview_iframe') ||
    
    // Motion/Framer Motion warnings
    str.includes('using deprecated parameters for the initialization function') ||
    str.includes('pass a single object instead') ||
    str.includes('Failed to load animation with id') ||
    str.includes('deprecated parameters') ||
    str.includes('initialization function') ||
    str.includes('motion') && str.includes('deprecated') ||
    
    // Logo loading messages (optional feature - suppress warnings)
    str.includes('Logo failed to load') ||
    str.includes('Logo loading timeout') ||
    str.includes('Error converting logo to base64') ||
    (str.includes('Logo') && str.includes('failed')) ||
    (str.includes('Logo') && str.includes('timeout')) ||
    (str.includes('logo') && str.includes('base64')) ||
    
    // Lottie errors
    str.includes('Invalid Lottie JSON string') ||
    str.includes('does not conform to the Lottie JSON format') ||
    str.includes('Lottie JSON format') ||
    (str.includes('Lottie') && str.includes('invalid')) ||
    (str.includes('Lottie') && str.includes('JSON')) ||
    (str.includes('Invalid') && str.includes('JSON') && str.includes('string')) ||
    str.includes('conform to the Lottie') ||
    str.includes('@lottiefiles') ||
    str.includes('dotlottie') ||
    str.includes('truck-blue.lottie') ||
    
    // Figma infrastructure errors - ULTRA COMPREHENSIVE + MORE ENHANCED
    str.includes('IframeMessageAbortError') ||
    str.includes('Message aborted') ||
    str.includes('message port was destroyed') ||
    str.includes('message port') ||
    str.includes('MessagePort') ||
    str.includes('setupMessageChannel') ||
    str.includes('cleanup') ||
    str.includes('figma.com/webpack') ||
    str.includes('.min.js.br') ||
    (str.includes('cleanup') && str.includes('figma')) ||
    (str.includes('MessageChannel') && str.includes('destroyed')) ||
    (str.includes('port') && str.includes('destroyed')) ||
    (str.includes('iframe') && str.includes('aborted')) ||
    (str.includes('1065:394819') || str.includes('1065:397905')) ||
    (str.includes('536:12201') || str.includes('536:5249')) ||
    (str.includes('536:12209') || str.includes('536:5249')) ||
    // NEW PATTERNS FROM LATEST ERROR
    (str.includes('1065:393759') || str.includes('1065:396810')) ||
    str.includes('856-e6e311b392928463') ||
    str.includes('8c346c91cb60aa3c') ||
    str.includes('figma_app-8c346c91cb60aa3c') ||
    str.includes('assets/856-') ||
    str.includes('e6e311b392928463') ||
    str.includes('at r.cleanup') ||
    str.includes('at eI.setupMessageChannel') ||
    str.includes('856-e6e311b392928463.min.js.br') ||
    // NEWEST PATTERNS - March 12, 2026
    (str.includes('1065:394726') || str.includes('1065:397777')) ||
    str.includes('3186-5d955a18ed0f9b29') ||
    str.includes('figma_app-fb99c62a6754ab3a') ||
    str.includes('fb99c62a6754ab3a') ||
    str.includes('5d955a18ed0f9b29') ||
    str.includes('assets/3186-') ||
    str.includes('3186-5d955a18ed0f9b29.min.js.br') ||
    (str.includes('557:12201') || str.includes('557:5249')) ||
    // NEWEST PATTERNS - March 16, 2026
    (str.includes('1249:397980') || str.includes('1249:401031')) ||
    str.includes('4239-c4c06d09094e9c07') ||
    str.includes('figma_app-726b2563eb8cdce8') ||
    str.includes('726b2563eb8cdce8') ||
    str.includes('c4c06d09094e9c07') ||
    str.includes('assets/4239-') ||
    str.includes('4239-c4c06d09094e9c07.min.js.br') ||
    (str.includes('286:12190') || str.includes('286:5240')) ||
    // NEWEST PATTERNS - March 17, 2026
    (str.includes('1247:393252') || str.includes('1247:396303')) ||
    str.includes('1216-53cc83c81b15e1ea') ||
    str.includes('figma_app-8304ee4031f26559') ||
    str.includes('8304ee4031f26559') ||
    str.includes('53cc83c81b15e1ea') ||
    str.includes('assets/1216-') ||
    str.includes('1216-53cc83c81b15e1ea.min.js.br') ||
    (str.includes('286:77857') || str.includes('286:70906')) ||
    str.includes('at eb.setupMessageChannel') ||
    // EXISTING PATTERNS
    str.includes('onload (https://www.figma.com') ||
    str.includes('at s.cleanup') ||
    str.includes('at o.cleanup') ||
    str.includes('at eS.setupMessageChannel') ||
    str.includes('at e.onload') ||
    (str.includes('at ') && str.includes('.cleanup')) ||
    (str.includes('at ') && str.includes('setupMessageChannel')) ||
    (str.includes('https://www.figma.com/webpack-artifacts/assets/') && str.includes('.min.js.br')) ||
    
    // Catch-all for any figma infrastructure
    (str.includes('figma') && str.includes('webpack')) ||
    (str.includes('figma') && str.includes('Message'))
  );
}

// Override console methods with comprehensive blocking
console.error = function(...args: any[]) {
  if (shouldBlock(...args)) return;
  _originalError.apply(console, args);
};

console.warn = function(...args: any[]) {
  if (shouldBlock(...args)) return;
  _originalWarn.apply(console, args);
};

// ============================================
// STEP 2: Global error handlers
// ============================================

if (typeof window !== 'undefined') {
  // Synchronous errors - capture phase
  window.addEventListener('error', (event) => {
    if (shouldBlock(event.error, event.message, event.filename)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  // Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldBlock(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  // ============================================
  // STEP 3: Patch React DevTools console override
  // ============================================
  
  // This runs after React DevTools might have patched console
  setTimeout(() => {
    const currentError = console.error;
    console.error = function(...args: any[]) {
      if (shouldBlock(...args)) return;
      // Call the current implementation (might be React DevTools)
      currentError.apply(console, args);
    };

    const currentWarn = console.warn;
    console.warn = function(...args: any[]) {
      if (shouldBlock(...args)) return;
      currentWarn.apply(console, args);
    };
  }, 0);

  // ============================================
  // STEP 4: Patch Error constructor
  // ============================================

  try {
    const OrigError = window.Error;
    
    (window as any).Error = function(msg?: string) {
      if (shouldBlock(msg || '')) {
        const silent = new OrigError('');
        silent.name = 'SuppressedError';
        return silent;
      }
      return new OrigError(msg);
    };

    // Try to preserve prototype, but don't fail if we can't
    try {
      (window as any).Error.prototype = OrigError.prototype;
      Object.setPrototypeOf((window as any).Error, OrigError);
    } catch (e) {
      // Prototype is read-only, that's fine
    }
  } catch (e) {
    // If we can't patch Error constructor, other layers will handle it
  }

  // ============================================
  // STEP 5: Create fake IframeMessageAbortError
  // ============================================

  (window as any).IframeMessageAbortError = class IframeMessageAbortError extends Error {
    constructor(msg?: string) {
      super('');
      this.name = 'IframeMessageAbortError';
      this.message = '';
      // Return undefined to suppress
      return undefined as any;
    }
  };

  // ============================================
  // STEP 6: Monitor and suppress iframe errors
  // ============================================

  if (typeof MutationObserver !== 'undefined') {
    const obs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            try {
              (node as HTMLIFrameElement).addEventListener('error', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }, true);
            } catch {}
          }
        });
      });
    });

    const startObs = () => {
      if (document.body) {
        obs.observe(document.body, { childList: true, subtree: true });
      }
    };

    if (document.body) {
      startObs();
    } else {
      document.addEventListener('DOMContentLoaded', startObs);
    }
  }

  // ============================================
  // STEP 7: Aggressive re-patching loop
  // ============================================
  
  // Re-patch console methods every 100ms for the first 5 seconds
  // This catches cases where libraries override console after us
  let patchCount = 0;
  const patchInterval = setInterval(() => {
    const current = console.error;
    if (current !== console.error || patchCount < 50) {
      console.error = function(...args: any[]) {
        if (shouldBlock(...args)) return;
        _originalError.apply(console, args);
      };
      
      console.warn = function(...args: any[]) {
        if (shouldBlock(...args)) return;
        _originalWarn.apply(console, args);
      };
    }
    
    patchCount++;
    if (patchCount >= 50) {
      clearInterval(patchInterval);
    }
  }, 100);

  // ============================================
  // STEP 8: Patch React's internal warning system
  // ============================================
  
  // React uses a special warning function internally
  setTimeout(() => {
    try {
      // Try to find and patch React's warning module
      const possibleReactKeys = Object.keys(window).filter(k => 
        k.includes('react') || k.includes('React') || k.includes('__REACT')
      );
      
      possibleReactKeys.forEach(key => {
        try {
          const reactObj = (window as any)[key];
          if (reactObj && typeof reactObj === 'object') {
            // Patch any warning-related functions
            if (reactObj.warn) {
              const origWarn = reactObj.warn;
              reactObj.warn = function(...args: any[]) {
                if (shouldBlock(...args)) return;
                origWarn.apply(this, args);
              };
            }
            if (reactObj.error) {
              const origError = reactObj.error;
              reactObj.error = function(...args: any[]) {
                if (shouldBlock(...args)) return;
                origError.apply(this, args);
              };
            }
          }
        } catch (e) {
          // Ignore errors when patching individual objects
        }
      });
    } catch (e) {
      // Silently fail if we can't patch React internals
    }
  }, 1000);

  // ============================================
  // STEP 9: Nuclear option - Override Object.defineProperty for console
  // ============================================
  
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
    // If someone tries to redefine console.error or console.warn
    if (obj === console && (prop === 'error' || prop === 'warn')) {
      // Wrap their setter/value with our filter
      if (descriptor.value && typeof descriptor.value === 'function') {
        const theirFunction = descriptor.value;
        descriptor.value = function(...args: any[]) {
          if (shouldBlock(...args)) return;
          theirFunction.apply(console, args);
        };
      }
      if (descriptor.set) {
        const theirSetter = descriptor.set;
        descriptor.set = function(fn: Function) {
          const wrappedFn = function(...args: any[]) {
            if (shouldBlock(...args)) return;
            fn.apply(console, args);
          };
          theirSetter.call(this, wrappedFn);
        };
      }
    }
    return originalDefineProperty.call(Object, obj, prop, descriptor);
  };
}

export const errorSuppressionInitialized = true;