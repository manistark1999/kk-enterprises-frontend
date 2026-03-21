import React, { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

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

  useEffect(() => {
    // Load the DotLottie web component script
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js';
      script.type = 'module';
      script.async = true;
      
      script.onload = () => {
        scriptLoadedRef.current = true;
        
        // Create the dotlottie-wc element
        if (containerRef.current && !containerRef.current.querySelector('dotlottie-wc')) {
          const lottieElement = document.createElement('dotlottie-wc');
          lottieElement.setAttribute('src', 'https://lottie.host/81140687-10bf-41f4-89b7-885956971bf9/2eKCsYt0cc.lottie');
          lottieElement.setAttribute('autoplay', 'true');
          lottieElement.setAttribute('loop', 'true');
          lottieElement.style.width = '300px';
          lottieElement.style.height = '300px';
          
          containerRef.current.appendChild(lottieElement);
          
          // Remove fallback if it exists
          const fallback = containerRef.current.querySelector('.lottie-fallback');
          if (fallback) fallback.remove();
        }
      };

      script.onerror = () => {
        console.warn('Failed to load Lottie animation, using fallback');
        renderFallback();
      };

      const renderFallback = () => {
        if (containerRef.current && !containerRef.current.querySelector('.lottie-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = 'lottie-fallback';
          fallback.style.width = '120px';
          fallback.style.height = '120px';
          fallback.style.borderRadius = '50%';
          fallback.style.border = `4px solid ${isDarkMode ? '#2563EB' : '#2563EB'}`;
          fallback.style.borderTopColor = 'transparent';
          fallback.style.animation = 'spin 1s linear infinite';
          containerRef.current.appendChild(fallback);
        }
      };

      // Set a timeout to render fallback if script doesn't load/respond quickly
      const timeoutId = setTimeout(() => {
        if (!scriptLoadedRef.current) renderFallback();
      }, 3000);

      document.head.appendChild(script);

      return () => {
        clearTimeout(timeoutId);
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isDarkMode]);

  return (
    <div style={themeStyles.container}>
      {/* Lottie Animation Container */}
      <div 
        ref={containerRef} 
        style={styles.animationContainer}
      >
        {/* Initial CSS Fallback rendered server-side/immediately */}
        <div className="lottie-fallback" style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `4px solid #2563EB`,
          borderTopColor: 'transparent',
          animation: 'spin 1.4s linear infinite',
          position: 'absolute'
        }} />
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