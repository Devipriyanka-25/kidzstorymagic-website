jest.mock('@/lib/replicate/client', () => ({
  getReplicateClient: jest.fn(),
  resolveModelVersionId: jest.fn(),
}));

// Mock backend dependencies that are not available in the test environment
jest.mock('../backend/src/config/database', () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));
jest.mock('../backend/src/services/story-generation.service', () => ({
  generateStoryContent: jest.fn(),
}));

const {
  buildStorybookPrompt,
  DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
} = require('@/lib/replicate/storyIllustrations');

// Backend StoryRenderer is plain CommonJS — require it directly without alias
const StoryRenderer = require('../backend/src/utils/storyRenderer');
const { STORYBOOK_NEGATIVE_PROMPT } = require('../backend/src/utils/storyRenderer');

describe('storybook illustration prompt', () => {
  it('pushes generated child art toward illustrated identity instead of copied photos', () => {
    const prompt = buildStorybookPrompt(
      'The child walks beside a friendly elephant in a glowing jungle.',
      DEFAULT_STORYBOOK_NEGATIVE_PROMPT
    );

    expect(prompt).toContain('2D illustrated');
    expect(prompt).toContain('IDENTITY REFERENCE ONLY');
    expect(prompt).toContain('redesign the outfit');
    expect(prompt).toContain('no readable text');
    expect(prompt).toContain('not photorealistic');
    expect(prompt).toContain('not a realistic jungle photo');
    expect(prompt).not.toContain('semi-realistic');
  });
});

describe('StoryRenderer.generateImagePrompt — backend 2D storybook enforcement', () => {
  const childData = { child_name: 'Aria', child_gender: 'female' };

  it('does not contain 3D illustration wording', () => {
    const prompt = StoryRenderer.generateImagePrompt(1, 'Sample story text', childData, 'adventure');
    expect(prompt).not.toMatch(/\b3D\b/);
  });

  it('does not contain semi-realistic wording', () => {
    const prompt = StoryRenderer.generateImagePrompt(1, 'Sample story text', childData, 'friends');
    expect(prompt).not.toContain('semi-realistic');
  });

  it('contains 2D illustrated storybook language', () => {
    const prompt = StoryRenderer.generateImagePrompt(1, 'Sample story text', childData, 'fairytale');
    expect(prompt).toContain('2D illustrated');
  });

  it('works for all built-in themes without 3D language', () => {
    const themes = ['friends', 'family', 'adventure', 'motivational', 'behavioural', 'fairytale', 'space', 'ocean', 'superhero', 'dinosaur', 'wizard', 'pirate', 'princess'];
    for (const theme of themes) {
      const prompt = StoryRenderer.generateImagePrompt(1, 'Text', childData, theme);
      expect(prompt).not.toMatch(/\b3D\b/);
      expect(prompt).not.toContain('semi-realistic');
    }
  });

  it('works for customizable theme without 3D language', () => {
    const prompt = StoryRenderer.generateImagePrompt(1, 'Text', childData, 'customizable', 'a magical space castle');
    expect(prompt).not.toMatch(/\b3D\b/);
    expect(prompt).not.toContain('semi-realistic');
    expect(prompt).toContain('2D illustrated');
  });

  it('exports STORYBOOK_NEGATIVE_PROMPT that excludes 3D and semi-realistic terms', () => {
    expect(STORYBOOK_NEGATIVE_PROMPT).toContain('3D render');
    expect(STORYBOOK_NEGATIVE_PROMPT).toContain('semi-realistic');
    expect(STORYBOOK_NEGATIVE_PROMPT).toContain('photorealistic');
  });
});
