import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import workshopImage from 'figma:asset/83f0e334507df0d1c94e11c3b5339bdfa586ce07.png';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SignInPageProps {
  isDarkMode: boolean;
}

export function SignInPage({ isDarkMode }: SignInPageProps) {
  const [email, setEmail] = useState('admin@kkenterprises.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // If the user was redirected here from a protected route, send them back
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      console.log(`[SignIn] Login success. Redirecting to: ${from}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-[#0F172A] to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-400'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-400'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative w-full max-w-6xl grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl ${
          isDarkMode 
            ? 'bg-gray-800/40 border border-gray-700/50' 
            : 'bg-white/80 border border-white/60'
        } backdrop-blur-xl`}
      >
        {/* Left Side - Logo & Branding */}
        <div className={`relative p-12 flex flex-col items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#2563EB]/20 to-[#1E3A8A]/20' 
            : 'bg-gradient-to-br from-[#DBEAFE]/50 to-[#60A5FA]/30'
        }`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <motion.div
              className={`absolute -top-10 -left-10 w-40 h-40 rounded-full ${
                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'
              }`}
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className={`absolute -bottom-10 -right-10 w-60 h-60 rounded-full ${
                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'
              }`}
              animate={{
                scale: [1.3, 1, 1.3],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Logo & Content */}
          <div className="relative z-10 text-center w-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 px-4"
            >
              <div className={`rounded-2xl overflow-hidden ${
                isDarkMode ? 'bg-white/5' : 'bg-white/50'
              } p-6 backdrop-blur-sm`}>
                <img 
                  src={workshopImage} 
                  alt="KK Enterprises Workshop" 
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className={`text-4xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                KK Enterprises
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Automobile Workshop Management
              </p>
              <div className={`mt-6 inline-block px-6 py-2 rounded-full ${
                isDarkMode 
                  ? 'bg-blue-600/30 border border-blue-500/50' 
                  : 'bg-blue-100 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Premium Workshop Solutions
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-10">
              <h2 className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome Back!
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-semibold">
                  {error}
                </div>
              )}

              {/* Username Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={`w-5 h-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className={`text-sm font-medium ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  } transition-colors`}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] hover:from-[#1E40AF] hover:to-[#1E3A8A] shadow-lg shadow-blue-500/30'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className={`absolute inset-0 flex items-center ${
                  isDarkMode ? 'opacity-30' : 'opacity-50'
                }`}>
                  <div className={`w-full border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 ${
                    isDarkMode ? 'bg-gray-800/40 text-gray-400' : 'bg-white/80 text-gray-500'
                  }`}>
                    Demo Credentials
                  </span>
                </div>
              </div>

              {/* Demo Credentials Info */}
              <div className={`p-4 rounded-xl ${
                isDarkMode 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-xs mb-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <strong>Quick Access:</strong>
                </p>
                <div className={`text-xs space-y-1 ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-600'
                }`}>
                  <p>Email: <span className="font-mono font-semibold">admin@kkenterprises.com</span></p>
                  <p>Password: <span className="font-mono font-semibold">admin123</span></p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-500' : 'text-gray-600'
        }`}>
          © 2026 KK Enterprises. All rights reserved.
        </p>
      </div>
    </div>
  );
}
