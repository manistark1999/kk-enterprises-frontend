import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  isDarkMode: boolean;
}

export function LoadingScreen({ isDarkMode }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white'
      }`}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-blue-600/10' : 'bg-blue-500/5'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? 'bg-blue-400/10' : 'bg-blue-400/5'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Lottie Animation Requested by User */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6"
        >
          {/* @ts-ignore - Custom Lottie Web Component */}
          <dotlottie-wc 
            src="https://lottie.host/81140687-10bf-41f4-89b7-885956971bf9/2eKCsYt0cc.lottie" 
            style={{ width: '300px', height: '300px' }} 
            autoplay 
            loop
          />
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-white via-blue-200 to-gray-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent'
          }`}>
            KK ENTERPRISES
          </h1>
          <p className={`text-sm font-medium tracking-[0.3em] uppercase ${
            isDarkMode ? 'text-blue-400/80' : 'text-blue-600/80'
          }`}>
            Workshop ERP System
          </p>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mb-6"
        >
          <p className={`text-lg font-medium flex items-center gap-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5" />
            </motion.span>
            Loading your workspace
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-80"
        >
          <div className={`h-2 rounded-full overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-gray-200/50 border border-gray-300/50'
          }`}>
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 1.5, 
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <motion.p
            className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Initializing dashboard components...
          </motion.p>
        </motion.div>
      </div>

      <style>{`
        /* Loading Dots Animation */
        .loading-dots {
          display: inline-block;
          margin-left: 2px;
        }

        .loading-dots span {
          animation: loadingDot 1.4s infinite;
          opacity: 0;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes loadingDot {
          0%, 20%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  );
}
