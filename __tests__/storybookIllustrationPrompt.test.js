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
    expect(prompt).toContain('IDENTITY REFERENCE RULE');
    expect(prompt).toContain('identity guidance only');
    expect(prompt).toContain('PAGE-SPECIFIC COSTUME DESIGN');
    expect(prompt).toContain('REFERENCE SANITIZATION RULE');
    expect(prompt).toContain('REFERENCE IMAGE FILTER');
    expect(prompt).toContain('STORY OVERRIDE RULE');
    expect(prompt).toContain('NON-NEGOTIABLE SCENE RULE');
    expect(prompt).toContain('OUTFIT OVERRIDE RULE');
    expect(prompt).toContain('FACE VIEW RULE');
    expect(prompt).toContain('STYLE OVERRIDE RULE');
    expect(prompt).toContain('not photorealistic');
    expect(prompt).toContain('SCENE BALANCE RULE');
    expect(prompt).toContain('WORLD SCALE RULE');
    expect(prompt).toContain('not a face swap');
    expect(prompt).not.toContain('semi-realistic');
    expect(prompt.indexOf('SCENE BLUEPRINT:')).toBeLessThan(
      prompt.indexOf('CHARACTER CREATION:')
    );
  });

  it('preserves a prebuilt scene-first brief instead of wrapping it again as plain text', () => {
    const sceneBrief = [
      '=== SCENE-FIRST STORY ILLUSTRATION ===',
      'CINEMATIC ENVIRONMENT: a glowing garage entrance with giant glass doors and friendly trucks nearby.',
      'COMPOSITION & FRAMING: medium-wide cinematic storytelling shot with the child naturally integrated.',
    ].join('\n');

    const prompt = buildStorybookPrompt(
      sceneBrief,
      DEFAULT_STORYBOOK_NEGATIVE_PROMPT
    );

    expect(prompt).toContain('SCENE BLUEPRINT: === SCENE-FIRST STORY ILLUSTRATION ===');
    expect(prompt.match(/=== SCENE-FIRST STORY ILLUSTRATION ===/g)).toHaveLength(1);
    expect(prompt).toContain('SCENE BALANCE RULE');
    expect(prompt).toContain('READABILITY RULE');
    expect(prompt).toContain('world and action should carry at least half of the visual storytelling weight');
  });
});
