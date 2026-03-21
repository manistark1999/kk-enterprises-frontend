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
        {/* Logo & Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Outer Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-4 ${
              isDarkMode ? 'border-blue-500/20' : 'border-blue-400/20'
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ width: '120px', height: '120px' }}
          />
          
          {/* Middle Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-4 border-transparent ${
              isDarkMode ? 'border-t-blue-500' : 'border-t-blue-600'
            }`}
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '120px', height: '120px' }}
          />

          {/* Center Icon */}
          <div
            className={`w-[120px] h-[120px] rounded-full flex items-center justify-center ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-500/50'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-400/50'
            }`}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Wrench className="w-12 h-12 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            KK Enterprises
          </h1>
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Workshop Management System
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
