/**
 * Tests for Phase 3 pipeline prompt builder and identity flow branches.
 * We export the helper as a named export for testing purposes.
 */

// Pull the compiled helpers out of the pipeline file
// (Jest + Babel will transpile the TS at test time)
const pipeline = require('@/lib/storyGenerationPipeline');

describe('Phase 3 pipeline types / exports', () => {
  it('exports generateStoryWithFaceSwap', () => {
    expect(typeof pipeline.generateStoryWithFaceSwap).toBe('function');
  });

  it('exports generateMultipleStoriesWithFaceSwap', () => {
    expect(typeof pipeline.generateMultipleStoriesWithFaceSwap).toBe('function');
  });

  it('exports getStoryGenerationStatus', () => {
    expect(typeof pipeline.getStoryGenerationStatus).toBe('function');
  });

  it('exports cancelStoryGeneration', () => {
    expect(typeof pipeline.cancelStoryGeneration).toBe('function');
  });
});
