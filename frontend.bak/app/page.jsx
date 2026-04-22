'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/utils/store';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="relative w-20 h-20 flex-shrink-0 bg-white rounded-xl p-2 shadow-xl"
                  >
                    <Image
                      src="/logo.png"
                      alt="Story Magic Logo"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100">Welcome to</p>
                    <h2 className="text-3xl font-black text-white">Story Magic</h2>
                  </div>
                </div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                  Create Magic Stories for Your Child
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                  Personalized, AI-powered storybooks where your child is the hero. Choose themes, pages, and watch us create a magical adventure.
                </p>
              </div>

              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/wizard"
                      className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl inline-block text-center"
                    >
                      ✨ Create Story Now
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard"
                      className="px-8 py-4 border-3 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-block text-center"
                    >
                      📚 My Stories
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/signup"
                      className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl inline-block text-center"
                    >
                      🚀 Get Started Free
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/login"
                      className="px-8 py-4 border-3 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-block text-center"
                    >
                      🔐 Sign In
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-8 pt-8 text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⭐</span>
                  <div>
                    <p className="font-bold text-lg">10K+</p>
                    <p className="text-blue-100">Families Trust Us</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📚</span>
                  <div>
                    <p className="font-bold text-lg">20K+</p>
                    <p className="text-blue-100">Stories Created</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⚡</span>
                  <div>
                    <p className="font-bold text-lg">1 Hour</p>
                    <p className="text-blue-100">Instant Delivery</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-3xl"></div>
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <Image
                  src="/logo.png"
                  alt="Story Magic - Create Magical Stories"
                  width={350}
                  height={350}
                  className="drop-shadow-2xl filter brightness-110"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Why Kids Love Our Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We create personalized experiences that spark imagination and celebrate your child
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '👶', title: 'Age-Appropriate', desc: 'Stories crafted for each age group' },
              { icon: '🎨', title: 'Beautifully Designed', desc: 'Professional illustrations & formatting' },
              { icon: '⚡', title: 'Instant Delivery', desc: 'PDF ready within 1 hour' },
              { icon: '🌈', title: '6 Unique Themes', desc: 'Family, Friends, Motivational & more' },
              { icon: '📸', title: 'Photo Integration', desc: 'Include your child in the story' },
              { icon: '💰', title: 'Affordable Pricing', desc: 'Starting from just $9.99' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <p className="text-6xl mb-6">{feature.icon}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create a magical story in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1️⃣', title: 'Choose Details', desc: 'Age, theme, pages & child info' },
              { num: '2️⃣', title: 'AI Creates', desc: 'Our AI writes the perfect story' },
              { num: '3️⃣', title: 'Review', desc: 'Check the preview before purchase' },
              { num: '4️⃣', title: 'Download', desc: 'Get your PDF instantly' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                  <p className="text-5xl mb-4">{step.num}</p>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-blue-100">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-3xl text-blue-300">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect package for your story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { pages: 10, price: '9.99', popular: false, features: ['10 Pages', 'One Theme', 'PDF Download', 'Email Delivery'] },
              { pages: 20, price: '14.99', popular: true, features: ['20 Pages', 'One Theme', 'PDF Download', 'Photo Integration', '⭐ Best Value'] },
              { pages: 30, price: '19.99', popular: false, features: ['30 Pages', 'One Theme', 'PDF Download', 'Photo Integration', 'Priority Support'] },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition-all duration-300 transform ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-2'
                }`}
              >
                {plan.popular && (
                  <div className="mb-6 inline-block bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-full text-sm">
                    🌟 Most Popular
                  </div>
                )}
                <p className="text-sm font-bold mb-2 opacity-75">Story Length</p>
                <h3 className="text-4xl font-black mb-2">{plan.pages}</h3>
                <p className="text-sm mb-8 opacity-75">pages per story</p>
                
                <div className="text-5xl font-black mb-8">
                  ${plan.price}
                  <span className="text-lg font-semibold opacity-75">/story</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 font-semibold">
                      <span className="text-2xl">✓</span> {feature}
                    </li>
                  ))}
                </ul>

                {user ? (
                  <Link
                    href="/wizard"
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 text-center block ${
                      plan.popular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Create Story
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 text-center block ${
                      plan.popular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Parents Love Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from families who've created magical stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', text: 'My daughter was so excited to see herself as the hero! She read it 10 times.', rating: '⭐⭐⭐⭐⭐' },
              { name: 'James P.', text: 'Best birthday gift ever. The quality is amazing and delivery was instant!', rating: '⭐⭐⭐⭐⭐' },
              { name: 'Emma L.', text: 'Worth every penny. My kids ask for more stories all the time now!', rating: '⭐⭐⭐⭐⭐' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                <p className="text-2xl mb-4">{testimonial.rating}</p>
                <p className="text-lg text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <p className="font-bold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 py-12 text-center"
        >
          <h2 className="text-5xl lg:text-6xl font-black mb-8">
            Ready to Create Magic?
          </h2>
          <p className="text-2xl mb-12 text-blue-100 max-w-2xl mx-auto">
            Start creating personalized stories for your child today!
          </p>
          {user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/wizard"
                className="inline-block px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                ✨ Create Story Now →
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/signup"
                className="inline-block px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                🚀 Join Now for Free →
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>
    </main>
  );
}
