import React from 'react';
import { motion } from 'framer-motion';
import paymentBadge from 'figma:asset/7db93014fd4dab5a20d969565abb863e03a0e9d9.png';

interface PaymentBadgeProps {
  isDarkMode: boolean;
  className?: string;
}

export function PaymentBadge({ isDarkMode, className = '' }: PaymentBadgeProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img 
        src={paymentBadge} 
        alt="Payment" 
        className="h-6 w-auto"
      />
    </motion.div>
  );
}
