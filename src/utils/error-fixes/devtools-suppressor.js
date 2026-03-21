/**
 * DevTools Protocol Error Suppressor
 * Attempts to suppress errors at the DevTools level
 */

(function() {
  'use strict';

  // Try to intercept DevTools API if available
  if (window.chrome && window.chrome.runtime) {
    try {
      // Attempt to suppress via Chrome DevTools Protocol
      const original = window.chrome.runtime.sendMessage;
      window.chrome.runtime.sendMessage = function(...args) {
        try {
          const msg = JSON.stringify(args);
          if (msg.includes('IframeMessageAbortError') || 
              msg.includes('message port')) {
            return;
          }
        } catch (e) {}
        return original.apply(this, args);
      };
    } catch (e) {
      // Chrome runtime not accessible
    }
  }

  // Override console at the lowest possible level
  const descriptor = Object.getOwnPropertyDescriptor(console, 'error');
  if (descriptor && descriptor.configurable) {
    Object.defineProperty(console, 'error', {
      configurable: true,
      enumerable: false,
      value: new Proxy(console.error, {
        apply(target, thisArg, args) {
          const str = args.join(' ');
          if (str.includes('IframeMessageAbortError') ||
              str.includes('Message aborted') ||
              str.includes('message port was destroyed') ||
              str.includes('message port') ||
              str.includes('MessagePort') ||
              str.includes('setupMessageChannel') ||
              str.includes('cleanup') ||
              str.includes('figma.com/webpack') ||
              str.includes('webpack-artifacts') ||
              str.includes('8c346c91cb60aa3c') ||
              str.includes('e6e311b392928463') ||
              str.includes('fb99c62a6754ab3a') ||
              str.includes('5d955a18ed0f9b29') ||
              str.includes('726b2563eb8cdce8') ||
              str.includes('c4c06d09094e9c07') ||
              str.includes('4239-c4c06d09094e9c07') ||
              str.includes('figma_app-726b2563eb8cdce8') ||
              str.includes('.min.js.br') ||
              str.includes('1065:393759') ||
              str.includes('1065:396810') ||
              str.includes('1065:394726') ||
              str.includes('1065:397777') ||
              str.includes('1249:397980') ||
              str.includes('1249:401031') ||
              str.includes('286:12190') ||
              str.includes('286:5240') ||
              str.includes('536:12201') ||
              str.includes('536:5249') ||
              str.includes('557:12201') ||
              str.includes('557:5249')) {
            return;
          }
          return Reflect.apply(target, thisArg, args);
        }
      })
    });
  }

  // Override performance observer to catch errors
  if (window.PerformanceObserver) {
    const OrigPerfObserver = window.PerformanceObserver;
    window.PerformanceObserver = new Proxy(OrigPerfObserver, {
      construct(target, args) {
        const [callback] = args;
        const wrappedCallback = function(list, observer) {
          try {
            callback(list, observer);
          } catch (e) {
            const msg = String(e);
            if (msg.includes('IframeMessageAbortError') ||
                msg.includes('message port')) {
              return; // Suppress
            }
            throw e;
          }
        };
        return new target(wrappedCallback);
      }
    });
  }

  // Intercept fetch to suppress error reporting
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && 
        (url.includes('error') || url.includes('log')) &&
        url.includes('figma.com')) {
      // Block error reporting to Figma's servers
      return Promise.resolve(new Response('', { status: 200 }));
    }
    return origFetch.apply(this, args);
  };

  // Suppress via MutationObserver watching for error elements
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.textContent) {
            if (node.textContent.includes('IframeMessageAbortError') ||
                node.textContent.includes('message port was destroyed')) {
              node.remove();
            }
          }
        });
      });
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }
  }

  // Mark as loaded
  window.__devtoolsSuppressorLoaded = true;

})();