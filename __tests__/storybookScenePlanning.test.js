const {
  buildStorySceneBrief,
  extractStorySceneDetails,
} = require("@/lib/storybook/scenePlanning");

describe("storybook scene planning", () => {
  it("extracts concrete cinematic story beats from page text", () => {
    const scene = extractStorySceneDetails({
      pageTitle: "Who greets them at the big glass door?",
      pageContent: "It's Savi, whom all the trucks adore!",
      theme: "goodnight-garage",
      sceneGuide: {
        setting:
          "a cozy toy garage attic with warm amber light, wooden rafters, playful little cars, soft window glow, and child-safe workshop wonder",
        interaction:
          "helping a toy car, greeting visitors at the entrance, and naturally moving through the garage world",
        palette:
          "golden amber, honey yellow, warm brown, soft blue, and creamy highlights",
      },
    });

    expect(scene.location).toContain("glass");
    expect(scene.objects.join(" ")).toContain("truck");
    expect(scene.action).toContain("greeting");
    expect(scene.characterPose).toContain("wave");
    expect(scene.timeOfDay).toContain("evening");
    expect(scene.lightingStyle).toContain("warm sunset");
    expect(scene.shotType).toContain("shot");
    expect(scene.cameraAngle).toContain("child-height");
    expect(scene.composition).toContain("text-safe band");
  });

  it("builds a scene-first story brief instead of a portrait-first prompt", () => {
    const brief = buildStorySceneBrief({
      childName: "Savi",
      childInterests: "trucks, garages, helping friends",
      childNotes: "keep the child warm, playful, and storybook age-appropriate",
      ageHint: "ages 3-5 with simple emotional clarity",
      pageTitle: "The Big Welcome",
      pageContent:
        "Who greets them at the big glass door? It's Savi, whom all the trucks adore!",
      theme: "goodnight-garage",
      sceneGuide: {
        setting:
          "a warm indoor storybook garage with toy cars, wooden beams, skylight moon glow, cozy corners, and golden workshop lighting",
        interaction:
          "welcoming little vehicle friends and naturally exploring the garage environment",
        palette:
          "honey gold, warm amber, soft brown, and midnight blue highlights",
      },
    });

    expect(brief).toContain("=== SCENE-FIRST STORY ILLUSTRATION ===");
    expect(brief).toContain("CINEMATIC ENVIRONMENT:");
    expect(brief).toContain("Storytelling objects that must read clearly in-frame");
    expect(brief).toContain("COMPOSITION & FRAMING:");
    expect(brief).toContain("Shot design:");
    expect(brief).toContain("Camera angle:");
    expect(brief).toContain("share the storytelling load");
    expect(brief).toContain("DON'T shrink the world");
    expect(brief).toContain("NOT centered portrait");
  });
});
