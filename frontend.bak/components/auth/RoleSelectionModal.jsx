'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * Role Selection Modal Component
 * Allows users to select between Admin and Customer roles
 * before proceeding with signup/login
 */
export default function RoleSelectionModal({ isOpen, onSelectRole }) {
  const roles = [
    {
      id: 'customer',
      name: 'Customer',
      description: 'Create personalized stories for children',
      icon: '👨‍👩‍👧‍👦',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-500'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage platform and users',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-500'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Select Your Role</h2>
              <p className="text-blue-100">Choose how you'd like to use Kidz Story Magic</p>
            </div>

            {/* Role Selection Cards */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${role.lightColor} ${role.borderColor} ${role.hoverColor}`}
                  >
                    <div className="text-5xl mb-4">{role.icon}</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">{role.name}</h3>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    
                    {/* Features based on role */}
                    <div className="text-sm text-gray-700 text-left space-y-1">
                      {role.id === 'customer' ? (
                        <>
                          <p>✓ Create custom stories</p>
                          <p>✓ Upload child photos</p>
                          <p>✓ Download PDF stories</p>
                          <p>✓ Multiple language support</p>
                        </>
                      ) : (
                        <>
                          <p>✓ Manage users</p>
                          <p>✓ View analytics</p>
                          <p>✓ Manage content</p>
                          <p>✓ System settings</p>
                        </>
                      )}
                    </div>

                    {/* Selection Button */}
                    <motion.div
                      className={`mt-4 py-2 px-4 rounded-lg bg-gradient-to-r ${role.color} text-white font-bold text-center`}
                    >
                      Choose {role.name}
                    </motion.div>
                  </motion.button>
                ))}
              </div>

              {/* Info Note */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  💡 <strong>Tip:</strong> You can change your role later in account settings
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
