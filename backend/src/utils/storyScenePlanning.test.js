const {
  buildBackendStorybookPrompt,
  extractStorySceneDetails,
} = require('./storyScenePlanning');

describe('backend story scene planning', () => {
  it('extracts a concrete scene from story text', () => {
    const scene = extractStorySceneDetails({
      pageTitle: 'The Big Welcome',
      pageContent:
        "Who greets them at the big glass door? It's Savi, whom all the trucks adore!",
      theme: 'garage',
      sceneGuide: {
        setting:
          'a warm indoor storybook garage with toy cars, wooden beams, glowing windows, cozy corners, and cinematic workshop depth',
        interaction:
          'welcoming vehicle friends, helping in the garage, or exploring storybook mechanical treasures',
        palette:
          'honey gold, warm amber, soft brown, and midnight blue highlights',
      },
    });

    expect(scene.location).toContain('glass');
    expect(scene.objects.join(' ')).toContain('truck');
    expect(scene.action).toContain('greeting');
    expect(scene.characterPose).toContain('wave');
    expect(scene.composition).toContain('printed story text');
  });

  it('builds a backend provider prompt that keeps the story scene primary', () => {
    const prompt = buildBackendStorybookPrompt({
      childName: 'Savi',
      childGender: 'female',
      pageNumber: 4,
      pageTitle: 'The Big Welcome',
      storyText:
        "Who greets them at the big glass door? It's Savi, whom all the trucks adore!",
      theme: 'garage',
      childInterests: 'trucks, helping, garages',
      childNotes: 'keep the child playful and emotionally warm',
      ageHint: 'ages 3-5 storybook tone',
    });

    expect(prompt).toContain('movie frame');
    expect(prompt).toContain('SCENE-FIRST');
    expect(prompt).toContain('SCENE BLUEPRINT');
    expect(prompt).toContain('no readable text or logos');
    expect(prompt).toContain('Avoid centered portrait-only framing');
  });
});
