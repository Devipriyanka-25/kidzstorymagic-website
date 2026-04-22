'use client';

import { motion } from 'framer-motion';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-6"
        >
          <div className="text-5xl">🔐</div>
        </motion.div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Authenticating...</h2>
        <p className="text-gray-600 mb-8">Please wait while we verify your credentials</p>
        
        <div className="flex justify-center gap-2">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-2.5 h-2.5 bg-blue-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
            className="w-2.5 h-2.5 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            className="w-2.5 h-2.5 bg-purple-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
