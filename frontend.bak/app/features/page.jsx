'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  const features = [
    {
      icon: '✨',
      title: 'Personalized Stories',
      description: 'Every story is uniquely crafted with your child\'s name, interests, and preferences built in.'
    },
    {
      icon: '🎨',
      title: 'AI-Generated Illustrations',
      description: 'Professional-quality illustrations created by advanced AI technology for each page.'
    },
    {
      icon: '🌈',
      title: 'Multiple Themes',
      description: 'Choose from 10+ exciting themes including Adventure, Space, Fairy Tales, Pirates, Dinosaurs, and more.'
    },
    {
      icon: '📖',
      title: 'Flexible Page Counts',
      description: 'Select from 10, 20, or 30-page stories based on your child\'s reading level and attention span.'
    },
    {
      icon: '👧',
      title: 'Age-Appropriate Content',
      description: 'Stories tailored for ages 0-2, 3-5, 6-8, 9-12 with developmentally appropriate themes and language.'
    },
    {
      icon: '📸',
      title: 'Photo Integration',
      description: 'Upload a photo and we\'ll incorporate your child\'s face into the story illustrations (with privacy protections).'
    },
    {
      icon: '📚',
      title: 'Multiple Download Formats',
      description: 'Download stories as beautiful PDFs or share directly with family and friends.'
    },
    {
      icon: '🔄',
      title: 'Unlimited Story Creation',
      description: 'Generate as many unique stories as you want with different themes, characters, and adventures.'
    },
    {
      icon: '🌍',
      title: 'Multi-Language Support',
      description: 'Stories available in English, Spanish, French, and more languages coming soon.'
    },
    {
      icon: '📱',
      title: 'Mobile-Friendly',
      description: 'Read stories on any device - tablets, smartphones, or computers with responsive design.'
    },
    {
      icon: '🎯',
      title: 'Educational Value',
      description: 'Stories incorporate curriculum themes, vocabulary development, and literacy building.'
    },
    {
      icon: '💝',
      title: 'Perfect Gifts',
      description: 'Print or digital gifts that show your child they\'re the hero of their own adventure.'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-black mb-6">Powerful Features Made Simple</h1>
            <p className="text-2xl text-blue-100 mb-8">
              Everything you need to create magical personalized stories for your child
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Story Magic vs. Traditional Books</h2>
          
          <div className="overflow-x-auto rounded-2xl shadow-lg">
            <table className="w-full bg-white">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Feature</th>
                  <th className="px-6 py-4 text-center font-bold">Story Magic</th>
                  <th className="px-6 py-4 text-center font-bold">Traditional Books</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Personalized with Child's Name</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Unlimited Unique Stories</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Instant Generation</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Themed Adventures</td>
                  <td className="px-6 py-4 text-center">✅ (10+ Themes)</td>
                  <td className="px-6 py-4 text-center">Limited</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Professional Illustrations</td>
                  <td className="px-6 py-4 text-center">✅ (AI-Generated)</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Affordable</td>
                  <td className="px-6 py-4 text-center">✅ ($10-20)</td>
                  <td className="px-6 py-4 text-center">$15-30</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-semibold">Digital & Print</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">Print Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-6">Ready to Create Magic?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start creating personalized stories for your child today. It takes just 5 minutes!
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  );
}
