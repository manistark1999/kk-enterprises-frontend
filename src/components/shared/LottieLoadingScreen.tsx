import React, { useState, useEffect } from 'react';

// Declare types for Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src: string, autoplay?: boolean | string, loop?: boolean | string }, HTMLElement>;
    }
  }
}

interface LottieLoadingScreenProps {
  isDarkMode: boolean;
  message?: string;
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
    background: '#ffffff',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  animationContainer: {
    width: '300px',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  text: {
    marginTop: '40px',
    fontSize: '24px',
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  subtitle: {
    marginTop: '12px',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500',
  },
};

export function LottieLoadingScreen({ 
  isDarkMode,
  message = 'Loading'
}: LottieLoadingScreenProps) {
  // Dynamic styles based on theme
  const themeStyles = {
    container: {
      ...styles.container,
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' 
        : '#ffffff',
    },
    text: {
      ...styles.text,
      color: isDarkMode ? '#f8fafc' : '#0F172A',
    },
    subtitle: {
      ...styles.subtitle,
      color: isDarkMode ? '#94a3b8' : '#64748b',
    }
  };

  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Show fallback spinner if it takes too long to render (e.g. script failed)
    const timer = setTimeout(() => {
      // Basic check to see if the element was upgraded to a custom element or has shadow root
      const wcElement = document.querySelector('dotlottie-wc');
      if (wcElement && !wcElement.shadowRoot) {
         setShowFallback(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={themeStyles.container}>
      {/* Lottie Animation Container */}
      <div style={styles.animationContainer}>
        {showFallback ? (
          <div className="lottie-fallback" style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `4px solid ${isDarkMode ? '#2563EB' : '#2563EB'}`,
            borderTopColor: 'transparent',
            animation: 'spin 1.4s linear infinite',
            position: 'absolute'
          }} />
        ) : (
          <dotlottie-wc 
            src="https://lottie.host/81140687-10bf-41f4-89b7-885956971bf9/2eKCsYt0cc.lottie" 
            style={{ width: '300px', height: '300px' }} 
            autoplay 
            loop
          ></dotlottie-wc>
        )}
      </div>

      {/* Loading Text with Animated Dots */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <p style={themeStyles.text}>
          {message}
          <span style={{ display: 'inline-block', marginLeft: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                animation: 'dotPulse 1.4s infinite',
                animationDelay: '0s',
              }}
            >
              .
            </span>
            <span
              style={{
                display: 'inline-block',
                animation: 'dotPulse 1.4s infinite',
                animationDelay: '0.2s',
              }}
            >
              .
            </span>
            <span
              style={{
                display: 'inline-block',
                animation: 'dotPulse 1.4s infinite',
                animationDelay: '0.4s',
              }}
            >
              .
            </span>
          </span>
        </p>

        {/* Subtitle */}
        <p style={themeStyles.subtitle}>
          KK Enterprises Workshop System
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}