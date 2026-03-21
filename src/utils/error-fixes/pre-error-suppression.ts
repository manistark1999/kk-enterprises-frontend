/**
 * PRE-LOAD Error Suppression
 * This runs BEFORE anything else to intercept Figma's IframeMessageAbortError
 * Must be imported before error-suppression.ts
 */

// Immediately create a global error trap
if (typeof window !== 'undefined') {
  // Prevent ANY error from showing
  const silentHandler = (event: any) => {
    try {
      const msg = String(
        event?.error?.message || 
        event?.message || 
        event?.reason?.message ||
        event?.reason ||
        event?.error?.stack ||
        ''
      );
      
      // Block Figma infrastructure errors - ULTRA COMPREHENSIVE
      if (
        msg.includes('IframeMessageAbortError') ||
        msg.includes('Message aborted') ||
        msg.includes('message port was destroyed') ||
        msg.includes('message port') ||
        msg.includes('setupMessageChannel') ||
        msg.includes('cleanup') ||
        msg.includes('figma.com/webpack') ||
        msg.includes('.min.js.br') ||
        msg.includes('webpack-artifacts') ||
        msg.includes('figma_app-') ||
        msg.includes('assets/856-') ||
        msg.includes('assets/3186-') ||
        msg.includes('assets/4239-') ||
        msg.includes('3435-') ||
        msg.includes('1065:') ||
        msg.includes('536:') ||
        msg.includes('557:') ||
        msg.includes('1249:') ||
        msg.includes('286:') ||
        msg.includes('at s.cleanup') ||
        msg.includes('at o.cleanup') ||
        msg.includes('at r.cleanup') ||
        msg.includes('at eS.setupMessageChannel') ||
        msg.includes('at eI.setupMessageChannel') ||
        msg.includes('at e.onload') ||
        msg.includes('856-e6e311b392928463') ||
        msg.includes('figma_app-8c346c91cb60aa3c') ||
        msg.includes('figma_app-fb99c62a6754ab3a') ||
        msg.includes('figma_app-726b2563eb8cdce8') ||
        msg.includes('3186-5d955a18ed0f9b29') ||
        msg.includes('4239-c4c06d09094e9c07') ||
        msg.includes('5d955a18ed0f9b29') ||
        msg.includes('fb99c62a6754ab3a') ||
        msg.includes('e6e311b392928463') ||
        msg.includes('8c346c91cb60aa3c') ||
        msg.includes('726b2563eb8cdce8') ||
        msg.includes('c4c06d09094e9c07')
      ) {
        // Prevent the error from propagating
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        return true; // Signal that we handled it
      }
    } catch (e) {
      // If we can't check the error, that's fine
    }
    return false;
  };

  // Override window.onerror IMMEDIATELY
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (silentHandler({ message, source, error })) {
      return true;
    }
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // Override window.onunhandledrejection IMMEDIATELY
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    if (silentHandler(event)) {
      return true;
    }
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event);
    }
    return false;
  };

  // Add listeners at the HIGHEST priority (capture phase)
  window.addEventListener('error', (event) => {
    silentHandler(event);
  }, { capture: true, passive: false });

  window.addEventListener('unhandledrejection', (event) => {
    silentHandler(event);
  }, { capture: true, passive: false });

  // Intercept console.error at the EARLIEST point
  const _origError = console.error;
  console.error = function(...args: any[]) {
    const str = args.map(a => String(a || '')).join(' ');
    if (
      str.includes('IframeMessageAbortError') ||
      str.includes('Message aborted') ||
      str.includes('message port was destroyed') ||
      str.includes('figma.com/webpack') ||
      str.includes('856-e6e311b392928463') ||
      str.includes('figma_app-8c346c91cb60aa3c') ||
      str.includes('figma_app-fb99c62a6754ab3a') ||
      str.includes('figma_app-726b2563eb8cdce8') ||
      str.includes('3186-5d955a18ed0f9b29') ||
      str.includes('4239-c4c06d09094e9c07') ||
      str.includes('5d955a18ed0f9b29') ||
      str.includes('fb99c62a6754ab3a') ||
      str.includes('726b2563eb8cdce8') ||
      str.includes('c4c06d09094e9c07')
    ) {
      return; // Silently ignore
    }
    _origError.apply(console, args);
  };
}

export const preErrorSuppressionInitialized = true;