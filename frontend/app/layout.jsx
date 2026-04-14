import React from 'react';
import Image from 'next/image';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'Kidz Story Magic',
  description: 'Create personalized AI-powered storybooks for your child',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white" suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-16">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-10 h-10">
                        <Image
                          src="/logo.png"
                          alt="Story Magic Logo"
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Story Magic</h3>
                        <p className="text-xs text-gray-400">Magical Stories</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Creating magical personalized storybooks for children worldwide.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/wizard" className="hover:text-white">Create Story</a></li>
                      <li><a href="/dashboard" className="hover:text-white">My Stories</a></li>
                      <li><a href="#features" className="hover:text-white">Features</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                      <li><a href="/blog" className="hover:text-white">Blog</a></li>
                      <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>Email: support@kidzstorymagic.com</li>
                      <li><a href="#" className="hover:text-white">Twitter</a></li>
                      <li><a href="#" className="hover:text-white">Facebook</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-8">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <p>&copy; 2026 Kidz Story Magic. All rights reserved.</p>
                    <div className="space-x-4">
                      <a href="/terms" className="hover:text-white">Terms</a>
                      <a href="/privacy" className="hover:text-white">Privacy</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
