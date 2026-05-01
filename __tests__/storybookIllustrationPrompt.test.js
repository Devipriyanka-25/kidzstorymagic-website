jest.mock('@/lib/replicate/client', () => ({
  getReplicateClient: jest.fn(),
  resolveModelVersionId: jest.fn(),
}));

const {
  buildStorybookPrompt,
  DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
} = require('@/lib/replicate/storyIllustrations');

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
