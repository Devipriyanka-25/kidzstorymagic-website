/**
 * Mock Data for Testing
 * Provides realistic test data for all user flows
 */

// Mock Users
export const MOCK_USERS = {
  customerUser: {
    id: 'user_001',
    email: 'customer@example.com',
    name: 'John Doe',
    role: 'customer',
    isPremium: false,
    storiesCreated: 2,
    createdAt: new Date('2024-01-01'),
    profileImageUrl: 'https://via.placeholder.com/150?text=JD'
  },
  premiumUser: {
    id: 'user_002',
    email: 'premium@example.com',
    name: 'Jane Smith',
    role: 'customer',
    isPremium: true,
    storiesCreated: 5,
    createdAt: new Date('2023-06-15'),
    profileImageUrl: 'https://via.placeholder.com/150?text=JS'
  },
  adminUser: {
    id: 'admin_001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    isPremium: true,
    storiesCreated: 0,
    createdAt: new Date('2023-01-01')
  }
};

// Mock Stories with realistic content
export const MOCK_STORIES = [
  {
    id: 'story_001',
    userId: 'user_001',
    title: 'Emma the Explorer',
    childName: 'Emma',
    childAge: 6,
    theme: 'adventure',
    genre: 'adventure',
    pageCount: 5,
    isPremium: false,
    generatedAt: new Date('2024-03-15'),
    status: 'completed',
    pages: [
      {
        pageNumber: 1,
        title: 'The Discovery',
        text: 'Emma found a mysterious map in her attic...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+1'
      },
      {
        pageNumber: 2,
        title: 'The Journey Begins',
        text: 'With her trusty backpack, Emma set out on her adventure...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+2'
      },
      {
        pageNumber: 3,
        title: 'The Hidden Forest',
        text: 'She discovered a magical forest filled with wonders...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+3'
      },
      {
        pageNumber: 4,
        title: 'The Treasure',
        text: 'Emma finally found the treasure marked on the map...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+4'
      },
      {
        pageNumber: 5,
        title: 'The Return Home',
        text: 'With her treasure, Emma returned home with amazing memories...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+5'
      }
    ]
  },
  {
    id: 'story_002',
    userId: 'user_001',
    title: 'Liam the Brave Knight',
    childName: 'Liam',
    childAge: 7,
    theme: 'fairytale',
    genre: 'fantasy',
    pageCount: 4,
    isPremium: false,
    generatedAt: new Date('2024-02-20'),
    status: 'completed',
    pages: [
      {
        pageNumber: 1,
        title: 'In the Castle',
        text: 'Liam was training to be a great knight...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+1'
      },
      {
        pageNumber: 2,
        title: 'The Challenge',
        text: 'A dragon threatened the kingdom...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+2'
      },
      {
        pageNumber: 3,
        title: 'The Battle',
        text: 'Liam faced the dragon with courage...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+3'
      },
      {
        pageNumber: 4,
        title: 'The Hero',
        text: 'Liam saved the kingdom and became a legend!',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+4'
      }
    ]
  },
  {
    id: 'story_003',
    userId: 'user_002',
    title: 'The Rainbow Friends Adventure',
    childName: 'Sofia & Marco',
    childAge: 5,
    theme: 'family',
    genre: 'friendship',
    pageCount: 6,
    isPremium: true,
    generatedAt: new Date('2024-03-01'),
    status: 'completed',
    pages: [
      {
        pageNumber: 1,
        title: 'Best Friends',
        text: 'Sofia and Marco were the best of friends...',
        imageUrl: 'https://via.placeholder.com/600x400?text=Page+1'
      },
      // ... additional pages
    ]
  }
];

// Mock Drafts (incomplete stories)
export const MOCK_DRAFTS = [
  {
    id: 'draft_001',
    userId: 'user_001',
    childName: 'Amy',
    childAge: 8,
    theme: 'creativity',
    step: 3,
    pageCount: 8,
    savedAt: new Date('2024-03-19'),
    formData: {
      ageGroup: '6-8',
      theme: 'creativity',
      pageCount: 8,
      childName: 'Amy',
      gender: 'girl',
      interests: ['art', 'music', 'painting'],
      specialNotes: 'Loves painting landscapes'
    }
  },
  {
    id: 'draft_002',
    userId: 'user_001',
    childName: 'Noah',
    childAge: 9,
    theme: 'adventure',
    step: 5,
    pageCount: 10,
    savedAt: new Date('2024-03-18'),
    formData: {
      ageGroup: '9-11',
      theme: 'adventure',
      pageCount: 10,
      childName: 'Noah',
      gender: 'boy',
      interests: ['sports', 'dinosaurs', 'space'],
      specialNotes: 'Wants to be an astronaut'
    }
  }
];

// Mock Payment/Order Data
export const MOCK_ORDERS = [
  {
    id: 'order_001',
    userId: 'user_001',
    storyId: 'story_001',
    orderId: 'ord_12345',
    amount: 4.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'stripe',
    pdfUrl: 'https://example.com/pdf/story_001.pdf',
    createdAt: new Date('2024-03-15')
  },
  {
    id: 'order_002',
    userId: 'user_002',
    subscriptionPlan: 'premium_monthly',
    amount: 9.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'stripe',
    renewalDate: new Date('2024-04-15'),
    createdAt: new Date('2024-03-15')
  }
];

// Theme options
export const MOCK_THEMES = [
  { id: 1, name: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 2, name: 'fairytale', label: 'Fairytale', emoji: '👑' },
  { id: 3, name: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 4, name: 'friendship', label: 'Friendship', emoji: '👫' },
  { id: 5, name: 'courage', label: 'Courage', emoji: '💪' },
  { id: 6, name: 'creativity', label: 'Creativity', emoji: '🎨' }
];

// Age groups
export const MOCK_AGE_GROUPS = [
  { id: 1, range: '3-5', label: '3-5 years', min: 3, max: 5 },
  { id: 2, range: '6-8', label: '6-8 years', min: 6, max: 8 },
  { id: 3, range: '9-11', label: '9-11 years', min: 9, max: 11 },
  { id: 4, range: '12+', label: '12+ years', min: 12, max: 18 }
];

// Test image blob for uploads
export const createMockImageBlob = (name = 'test-image.jpg') => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Draw a gradient
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, 'rgb(200, 100, 100)');
  gradient.addColorStop(1, 'rgb(100, 150, 200)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  // Add skin tone patch for face detection testing
  ctx.fillStyle = 'rgb(220, 180, 150)';
  ctx.beginPath();
  ctx.arc(128, 110, 40, 0, Math.PI * 2);
  ctx.fill();
  
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob], name, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
};

/**
 * Get random mock story
 */
export const getRandomStory = () => {
  return MOCK_STORIES[Math.floor(Math.random() * MOCK_STORIES.length)];
};

/**
 * Get random mock user
 */
export const getRandomUser = () => {
  const users = Object.values(MOCK_USERS);
  return users[Math.floor(Math.random() * users.length)];
};

/**
 * Create a complete mock project data for testing wizard
 */
export const createMockProjectData = () => {
  return {
    projectId: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ageGroup: '6-8',
    theme: 'adventure',
    pageCount: 5,
    childName: 'Test Child',
    gender: 'boy',
    interests: ['sports', 'dinosaurs'],
    specialNotes: 'Loves adventure stories',
    uploadedImages: [],
    generatedStory: null,
    isPremium: false
  };
};

/**
 * Simulate API delay for testing loading states
 */
export const simulateDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulate API error for testing error handling
 */
export const simulateError = (message = 'Simulated API Error', code = 500) => {
  return Promise.reject({
    response: {
      status: code,
      data: {
        error: message,
        message: message
      }
    }
  });
};
