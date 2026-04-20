'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BlogPostPage() {
  const params = useParams();
  const postId = parseInt(params.id, 10); // Convert string to number

  // Blog post content
  const blogPosts = {
    1: {
      title: 'The Power of Personalized Storytelling for Child Development',
      date: 'April 1, 2026',
      category: 'Education',
      author: 'Dr. Sarah Mitchell',
      image: '📚',
      sections: [
        {
          heading: 'Introduction',
          content: 'Personalized storytelling has emerged as a powerful tool in child development. When children see themselves as the heroes of their own stories, it creates a profound impact on their emotional and cognitive development.'
        },
        {
          heading: 'The Science Behind Personalization',
          content: 'Research shows that when children encounter stories with familiar names and situations, they engage more deeply with the narrative. This increased engagement leads to better retention, improved reading comprehension, and stronger emotional connections to the material.\n\nDr. Emily Chen from the Institute of Child Development found that children who read personalized stories showed a 35% improvement in reading comprehension compared to those who read traditional stories.'
        },
        {
          heading: 'Emotional Benefits',
          content: 'When a child is the main character in a story, they experience a unique form of emotional validation. They realize that their feelings, experiences, and perspectives matter. This boosts self-esteem and confidence significantly.',
          bullets: [
            'Increased confidence and self-worth',
            'Better emotional regulation',
            'Deeper engagement with reading material',
            'Improved attention span',
            'Enhanced imagination and creativity'
          ]
        },
        {
          heading: 'Cognitive Development',
          content: 'Personalized stories engage different parts of the brain compared to standard stories. The recognition of personal details activates the self-referential processing network, which helps strengthen cognitive pathways.'
        },
        {
          heading: 'Conclusion',
          content: 'Personalized storytelling is not just an entertainment tool—it\'s a developmental powerhouse. By making children the heroes of their own stories, we\'re investing in their emotional growth, cognitive development, and lifelong love of reading.'
        }
      ]
    },
    2: {
      title: 'Top 10 Themes That Kids Love',
      date: 'March 28, 2026',
      category: 'Stories',
      author: 'Michael Rodriguez',
      image: '✨',
      sections: [
        {
          heading: 'Most Popular Themes',
          content: 'Over the past year, Story Magic has analyzed thousands of stories created on our platform. Here are the top 10 themes that kids absolutely love:'
        },
        {
          heading: '1. Adventure & Exploration',
          content: 'Adventure themes consistently rank at the top. Children love embarking on journeys, discovering new lands, and overcoming challenges. Whether it\'s a jungle expedition or a mountain quest, adventure stories tap into kids\' natural curiosity and desire for exploration.'
        },
        {
          heading: '2. Space & Sci-Fi',
          content: 'Space exploration captures the imagination like nothing else. Themes involving astronauts, alien worlds, and futuristic technology are huge hits, especially with children ages 6-12.'
        },
        {
          heading: '3. Fairy Tales & Magic',
          content: 'Classic fairy tale elements with a twist remain timeless. Kids love stories with magic, enchantment, and mystical creatures.'
        },
        {
          heading: '4. Friendship & Collaboration',
          content: 'Stories about making friends and working together resonate deeply with children, helping them develop social skills.'
        },
        {
          heading: '5-10. Other Popular Themes',
          bullets: ['Superhero Adventures', 'Dinosaur Discoveries', 'Pirate Quests', 'Princess Adventures', 'Ocean Mysteries', 'Wizard\'s Academy']
        },
        {
          heading: 'How to Choose',
          content: 'When selecting a theme for your child\'s story, consider their interests and what captures their imagination most. The best story is one that makes your child feel excited and engaged.'
        }
      ]
    },
    3: {
      title: 'How AI is Revolutionizing Children\'s Literature',
      date: 'March 22, 2026',
      category: 'Technology',
      author: 'Lisa Chen',
      image: '🤖',
      sections: [
        {
          heading: 'The AI Revolution in Publishing',
          content: 'Artificial intelligence is transforming how we create and consume children\'s literature. What was once only possible with teams of writers and illustrators can now be accomplished in minutes.'
        },
        {
          heading: 'Unlimited Personalization',
          content: 'Traditional publishing can only produce a limited number of titles. AI enables truly unlimited personalization—every story can be different, tailored to each individual child\'s preferences and interests.'
        },
        {
          heading: 'Instant Illustration Generation',
          content: 'Gone are the days of waiting months for an illustrator. AI can generate professional-quality illustrations instantly, making story creation faster and more affordable than ever before.'
        },
        {
          heading: 'Accessibility & Affordability',
          content: 'AI-powered stories democratize children\'s literature. High-quality personalized books are now accessible to families at a fraction of the traditional cost.'
        },
        {
          heading: 'The Future',
          content: 'As AI technology continues to advance, we\'ll see even more possibilities: interactive stories, adaptive difficulty levels, and stories that learn and evolve with each child\'s reading progress.'
        },
        {
          heading: 'Concerns & Considerations',
          content: 'While AI offers tremendous benefits, it\'s important to maintain human creativity and storytelling traditions alongside these technological advances. The best future combines AI capabilities with human artistry and emotional intelligence.'
        }
      ]
    }
  };

  const post = blogPosts[postId] || blogPosts[1];

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, this blog post doesn't exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold">
          ← Back to Blog
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-12 text-7xl flex items-center justify-center h-64">
            {post.image}
          </div>

          <div className="p-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-gray-500">{post.date}</span>
            </div>

            <h1 className="text-5xl font-black text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-600">Story Magic Editor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <article className="space-y-8">
            {post.sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {section.content.split('\n')
                    .filter(p => p.trim())
                    .map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                </div>
                {section.bullets && (
                  <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                    {section.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </article>

          {/* Related Posts */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">More Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((id) => (
                <Link
                  key={id}
                  href={`/blog/${id}`}
                  className="group bg-blue-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{blogPosts[id]?.image}</div>
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                    {blogPosts[id]?.title}
                  </h4>
                  <p className="text-sm text-gray-600">{blogPosts[id]?.category}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Create Your Child's Story Today</h2>
          <p className="mb-8 text-blue-100">
            Read how personalized stories can transform your child's reading habits
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </main>
  );
}
