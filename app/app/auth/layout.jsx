import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Kidz Story Magic</h1>
          <p className="text-gray-600">Create magical stories for your children</p>
        </div>
        
        {children}
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Protected by security & SSL encryption</p>
        </div>
      </div>
    </div>
  );
}
