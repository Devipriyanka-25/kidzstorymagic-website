'use client';

import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'The Power of Personalized Storytelling for Child Development',
      date: 'April 1, 2026',
      category: 'Education',
      excerpt: 'Discover how personalized stories can enhance your child\'s imagination, reading skills, and emotional development.',
      image: '📚'
    },
    {
      id: 2,
      title: 'Top 10 Themes That Kids Love',
      date: 'March 28, 2026',
      category: 'Stories',
      excerpt: 'Explore the most popular themes on Story Magic and find the perfect adventure for your child.',
      image: '✨'
    },
    {
      id: 3,
      title: 'How AI is Revolutionizing Children\'s Literature',
      date: 'March 22, 2026',
      category: 'Technology',
      excerpt: 'Learn how artificial intelligence is making it possible to create custom stories instantly.',
      image: '🤖'
    },
    {
      id: 4,
      title: 'Parent Tips: Making Reading Fun for Every Age',
      date: 'March 15, 2026',
      category: 'Parenting',
      excerpt: 'Expert advice on how to engage children at every developmental stage with stories.',
      image: '👨‍👩‍👧‍👦'
    },
    {
      id: 5,
      title: 'Behind the Scenes: Creating Your Story',
      date: 'March 8, 2026',
      category: 'Behind the Scenes',
      excerpt: 'Take a look at how our AI creates unique illustrations and stories just for your child.',
      image: '🎨'
    },
    {
      id: 6,
      title: 'Success Stories: How Story Magic Changed Bedtime',
      date: 'February 28, 2026',
      category: 'Stories',
      excerpt: 'Real stories from parents about how personalized books transformed their children\'s reading habits.',
      image: '💫'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">Tips, insights, and stories from the Story Magic community</p>
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-5xl flex items-center justify-center h-40">
                {post.image}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.id}`} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6 text-blue-100">
            Get weekly tips, story ideas, and exclusive offers delivered to your inbox
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
