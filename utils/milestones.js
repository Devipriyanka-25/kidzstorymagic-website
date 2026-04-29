const AGE_GROUP_ALIASES = {
  infants: '0-2',
  toddlers: '3-5',
  children: '5-8',
  preteens: '8-12',
  teens: '12+',
  adults: '12+',
  '2-5': '3-5',
  '6-11': '5-8',
};

function normalizeMilestoneAgeGroup(ageGroup) {
  const normalizedAgeGroup = String(ageGroup || '').trim();

  if (!normalizedAgeGroup) {
    return '';
  }

  return AGE_GROUP_ALIASES[normalizedAgeGroup] || normalizedAgeGroup;
}

export const MILESTONES = Object.freeze([
  {
    id: 'birthday',
    ageGroups: ['3-5', '5-8'],
    emoji: '\u{1F382}',
    title: 'Birthday',
    subtitle: 'Celebrate their special day',
    promptHint:
      'a magical birthday adventure filled with confidence, celebration, and joyful surprises',
    coverBadge: 'Happy Birthday',
    relatedThemeIds: ['milestone-magic', 'birthday-bash'],
  },
  {
    id: 'first-day-school',
    ageGroups: ['3-5', '5-8'],
    emoji: '\u{1F392}',
    title: 'First Day of School',
    subtitle: 'Turn new beginnings into a brave adventure',
    promptHint:
      'starting school with courage, kindness, and the excitement of making new friends',
    coverBadge: 'First Day Hero',
    relatedThemeIds: ['milestone-magic', 'brave-little-hero'],
  },
  {
    id: 'new-sibling',
    ageGroups: ['3-5', '5-8', '12+'],
    emoji: '\u{1F476}',
    title: 'New Baby Sibling',
    subtitle: 'Celebrate becoming a big sister or brother',
    promptHint:
      'welcoming a new baby with love and discovering the magic of being a proud big sibling',
    coverBadge: 'Big Sibling',
    relatedThemeIds: ['milestone-magic', 'siblings'],
  },
  {
    id: 'first-birthday',
    ageGroups: ['0-2', '3-5'],
    emoji: '\u{1F388}',
    title: 'First Birthday',
    subtitle: 'A keepsake story for a once-in-a-lifetime milestone',
    promptHint:
      'a warm first-birthday celebration full of family love, bright decorations, and sweet wonder',
    coverBadge: 'First Birthday',
    relatedThemeIds: ['milestone-magic', 'birthday-bash'],
  },
  {
    id: 'lost-first-tooth',
    ageGroups: ['0-2', '3-5'],
    emoji: '\u{1F9B7}',
    title: 'First Tooth',
    subtitle: 'Turn a wiggly milestone into a magical keepsake',
    promptHint:
      'losing a first tooth, meeting a kind tooth fairy, and discovering brave little moments can feel magical',
    coverBadge: 'Tooth Fairy Visit',
    relatedThemeIds: ['first-tooth-tale', 'milestone-magic'],
  },
  {
    id: 'first-steps',
    ageGroups: ['0-2'],
    emoji: '\u{1F463}',
    title: 'First Steps / Sitting Up',
    subtitle: 'Celebrate those wobbly little wins',
    promptHint:
      'a proud family milestone where little steps, sitting up, and early movement become a joyful keepsake adventure',
    coverBadge: 'Little Steps',
    relatedThemeIds: ['first-steps-cheer', 'milestone-magic'],
  },
  {
    id: 'first-words',
    ageGroups: ['0-2'],
    emoji: '\u{1F4AC}',
    title: 'First Words',
    subtitle: 'Capture a sweet voice finding its magic',
    promptHint:
      'first sounds and first words becoming a loving family celebration full of wonder, smiles, and proud happy hearts',
    coverBadge: 'First Words',
    relatedThemeIds: ['first-words-wonder', 'milestone-magic'],
  },
  {
    id: 'graduation',
    ageGroups: ['5-8', '8-12', '12+'],
    emoji: '\u{1F393}',
    title: 'Graduation / Moving Up',
    subtitle: 'Celebrate growth, pride, and what comes next',
    promptHint:
      'celebrating a proud achievement and stepping into the next big adventure with confidence',
    coverBadge: 'Graduate',
    relatedThemeIds: ['promotion', 'milestone-magic'],
  },
  {
    id: 'potty-training',
    ageGroups: ['3-5'],
    emoji: '\u{1F308}',
    title: 'Potty Training Win',
    subtitle: 'A playful story for a very big-kid victory',
    promptHint:
      'reaching a big-kid milestone with encouragement, confidence, and lots of cheerful celebration',
    coverBadge: 'Big Kid Now',
    relatedThemeIds: ['brave-little-hero', 'milestone-magic'],
  },
  {
    id: 'moving-home',
    ageGroups: ['3-5', '5-8', '12+'],
    emoji: '\u{1F3E0}',
    title: 'Moving to a New Home',
    subtitle: 'Make a fresh start feel exciting and cozy',
    promptHint:
      'exploring a brand new home, making it feel special, and discovering adventure in a new neighborhood',
    coverBadge: 'New Home',
    relatedThemeIds: ['milestone-magic', 'family-celebration'],
  },
]);

export function getMilestonesForAgeGroup(ageGroup) {
  const normalizedAgeGroup = normalizeMilestoneAgeGroup(ageGroup);

  if (!normalizedAgeGroup) {
    return [...MILESTONES];
  }

  return MILESTONES.filter((milestone) =>
    milestone.ageGroups.includes(normalizedAgeGroup)
  );
}

export function getMilestoneById(milestoneId) {
  return MILESTONES.find((milestone) => milestone.id === milestoneId) || null;
}

export function getMilestoneFormData(milestoneOrId) {
  const milestone =
    typeof milestoneOrId === 'string'
      ? getMilestoneById(milestoneOrId)
      : milestoneOrId;

  if (!milestone) {
    return {
      selectedMilestoneId: '',
      milestoneTitle: '',
      milestonePromptHint: '',
      milestoneCoverBadge: '',
    };
  }

  return {
    selectedMilestoneId: milestone.id,
    milestoneTitle: milestone.title,
    milestonePromptHint: milestone.promptHint,
    milestoneCoverBadge: milestone.coverBadge,
  };
}

export function getPreferredThemeForMilestone(milestoneOrId) {
  const milestone =
    typeof milestoneOrId === 'string'
      ? getMilestoneById(milestoneOrId)
      : milestoneOrId;

  return milestone?.relatedThemeIds?.[0] || null;
}
