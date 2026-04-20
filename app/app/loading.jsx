'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <div className="text-6xl mb-4">✨</div>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Creating your magical story experience</p>
        
        <div className="mt-8 flex justify-center gap-2">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="w-3 h-3 bg-blue-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
            className="w-3 h-3 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-purple-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
