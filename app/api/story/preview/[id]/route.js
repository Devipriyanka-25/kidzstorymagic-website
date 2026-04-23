/**
 * Story Preview Endpoint
 * GET /api/story/preview/[id]
 * Returns full HTML preview of a story for display
 */

import { NextResponse } from 'next/server';

// Mock story data with full HTML content
const mockStories = {
  story_1: {
    id: 'story_1',
    title: "Emma's Amazing Adventure",
    description: 'A magical journey through enchanted forests and hidden kingdoms',
    childName: 'Emma',
    theme: 'Adventure',
    pages: 20,
    htmlContent: `
      <div style="font-family: 'Comic Sans MS', cursive; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="color: white; text-align: center; font-size: 48px; margin-bottom: 20px;">✨ Emma's Amazing Adventure ✨</h1>
        
        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #667eea; font-size: 32px;">Chapter 1: The Discovery</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            On a sunny morning, Emma found a mysterious golden door hidden behind the old oak tree in her backyard. 
            Her heart raced with excitement as she reached for the handle. The door glowed with an ethereal light, 
            and she knew this was the beginning of something magical.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            When she opened the door, a cascade of sparkling light surrounded her, and she was transported to a 
            beautiful realm filled with floating islands, rainbow waterfalls, and friendly creatures she had never seen before.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #667eea; font-size: 32px;">Chapter 2: Meeting the Crystal Guardians</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            A group of friendly creatures called the Crystal Guardians welcomed Emma. They had been waiting for someone brave 
            enough to help them. An ancient curse had hidden the magical Crystal of Hope, and only someone pure of heart 
            could find it.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            Emma accepted the quest without hesitation. The Guardians gave her a special compass that would guide her 
            through the enchanted forests toward the Crystal's location.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #667eea; font-size: 32px;">Chapter 3: The Enchanted Forest</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            Emma ventured into the Enchanted Forest, where trees whispered secrets and flowers sang songs. 
            She encountered challenges but always found a way through. Her bravery and kindness were rewarded when 
            the forest creatures began helping her on her journey.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            A wise old owl showed her hidden paths, and a family of rabbits shared their knowledge of the secret passages.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #667eea; font-size: 32px;">The Magical Ending</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            After many adventures and moments of triumph, Emma finally found the Crystal of Hope glowing in 
            a hidden chamber beneath the mountains. When she held it, brilliant light filled the realm, 
            breaking the ancient curse forever.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            The Crystal Guardians celebrated Emma as their hero. Before returning home, they gave her a small 
            piece of the crystal as a reminder of her bravery. Emma learned that true magic comes from courage, 
            kindness, and believing in yourself.
          </p>
          <p style="color: #667eea; font-size: 20px; font-weight: bold; text-align: center; margin-top: 20px;">
            The End 🌟
          </p>
        </div>
      </div>
    `,
    downloadUrls: {
      pdf: '/downloads/emmas-amazing-adventure.pdf',
      epub: '/downloads/emmas-amazing-adventure.epub',
    },
  },

  story_2: {
    id: 'story_2',
    title: 'The Magic Kingdom',
    description: 'A tale of wonder and discovery in a mystical kingdom',
    childName: 'Alex',
    theme: 'Fantasy',
    pages: 20,
    htmlContent: `
      <div style="font-family: 'Georgia', serif; padding: 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h1 style="color: white; text-align: center; font-size: 48px; margin-bottom: 20px;">👑 The Magic Kingdom 👑</h1>
        
        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #f5576c; font-size: 32px;">Once Upon a Time...</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            In a land far away, beyond mountains that touched the clouds and rivers that sparkled like diamonds, 
            there existed a magnificent Magic Kingdom. This wasn't just any kingdom - it was a place where dreams came true 
            and impossible things became possible.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            Alex, a curious and adventurous child, stumbled upon this kingdom by accident while exploring an old castle tower. 
            A secret passage revealed itself, and suddenly, Alex was standing in the most beautiful place imaginable.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #f5576c; font-size: 32px;">The Royal Welcome</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            The Queen of the Magic Kingdom appeared before Alex in a shimmer of gold and stardust. She wore a crown that 
            glowed with internal light and robes that seemed to be woven from moonbeams themselves.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            "Welcome, noble traveler," the Queen said with a warm smile. "We have been expecting someone special. 
            The kingdom's magic has been fading, and only someone with a pure heart can restore it."
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #f5576c; font-size: 32px;">The Quest Begins</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            Alex was given a magical amulet that would guide them through three trials. The first trial led to a valley 
            where dragons lived - but these dragons were gentle and kind. They taught Alex about the power of friendship.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            The second trial was in the Forest of Illusions, where nothing was as it seemed. Only by trusting instincts 
            could Alex navigate through the confusion and find the path forward.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #f5576c; font-size: 32px;">The Final Challenge</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            The final trial required Alex to climb the Tower of Echoes, where every doubt and fear was amplified. 
            But Alex remembered the lessons from the dragons and the wisdom from the forest, and climbed with courage 
            burning in their heart.
          </p>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            At the top of the tower, Alex found the Heart of Magic - a crystal pulsing with pure, brilliant light. 
            When Alex touched it, the magic flowed back into the kingdom, making everything more beautiful than before.
          </p>
        </div>

        <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 style="color: #f5576c; font-size: 32px;">The Eternal Reward</h2>
          <p style="color: #333; font-size: 18px; line-height: 1.8;">
            The Queen knighted Alex as the Guardian of Magic. From that day on, Alex could visit the Magic Kingdom 
            whenever they wished, and the kingdom thrived with even more magic than before.
          </p>
          <p style="color: #f5576c; font-size: 20px; font-weight: bold; text-align: center; margin-top: 20px;">
            And they all lived happily ever after ✨
          </p>
        </div>
      </div>
    `,
    downloadUrls: {
      pdf: '/downloads/the-magic-kingdom.pdf',
      epub: '/downloads/the-magic-kingdom.epub',
    },
  },
};

export async function GET(request, { params }) {
  try {
    const { id } = params;

    console.log('[PREVIEW] Fetching preview for story:', id);

    // Get story from mock data
    const story = mockStories[id];

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found', id },
        { status: 404 }
      );
    }

    // Return full story with HTML content
    return NextResponse.json(
      {
        success: true,
        story: {
          id: story.id,
          title: story.title,
          description: story.description,
          childName: story.childName,
          theme: story.theme,
          pages: story.pages,
          htmlContent: story.htmlContent,
          downloadUrls: story.downloadUrls,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PREVIEW] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch story preview',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
