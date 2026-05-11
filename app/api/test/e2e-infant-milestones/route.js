import { NextResponse } from 'next/server';
import {
  getBookTheme,
  getCategoriesByAgeGroup,
  getThemesByCategory,
} from '@/utils/themes';
import {
  getMilestonesForAgeGroup,
  getPreferredThemeForMilestone,
} from '@/utils/milestones';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function areTestRoutesEnabled() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_TEST_ROUTES === 'true'
  );
}

function getRepresentativeAge(ageGroup) {
  const matches = String(ageGroup || '').match(/\d+/g) || [];

  if (!matches.length) {
    return 1;
  }

  if (String(ageGroup).includes('+')) {
    return Number(matches[0]);
  }

  if (matches.length === 1) {
    return Number(matches[0]);
  }

  const minAge = Number(matches[0]);
  const maxAge = Number(matches[1]);

  return Math.min(maxAge, minAge + 1);
}

function buildRunId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function findMatchingCategory(ageGroup, milestoneThemeId) {
  const categories = getCategoriesByAgeGroup(ageGroup);

  return Object.entries(categories).find(([, category]) =>
    category.themes.includes(milestoneThemeId)
  );
}

async function createE2ETestAuthSession(requestUrl) {
  const registerEndpoint = new URL('/api/auth/register', requestUrl.origin);
  const runId = buildRunId();
  const response = await fetch(registerEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `E2E Test ${runId}`,
      email: `e2e_infant_${runId}@example.com`,
      password: 'E2EPass123!',
      preferredCurrency: 'USD',
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.token) {
    throw new Error(
      payload?.error ||
        payload?.details ||
        `Failed to create E2E auth session (${response.status}).`
    );
  }

  return payload.token;
}

export async function GET(request) {
  if (!areTestRoutesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const ageGroup = requestUrl.searchParams.get('ageGroup') || '0-2';
  const milestones = getMilestonesForAgeGroup(ageGroup);
  const storyEndpoint = new URL('/api/story/generate', requestUrl.origin);

  if (!milestones.length) {
    return NextResponse.json(
      {
        status: 'FAILED',
        ageGroup,
        error: 'No milestones available for the requested age group.',
      },
      { status: 404 }
    );
  }

  const candidateMilestones = milestones
    .map((milestone) => {
      const preferredThemeId = getPreferredThemeForMilestone(milestone);
      const selectedTheme = getBookTheme(preferredThemeId);
      const matchingCategory = findMatchingCategory(ageGroup, selectedTheme.value);

      return {
        milestone,
        selectedTheme,
        matchingCategory: matchingCategory || null,
      };
    })
    .filter(({ matchingCategory }) => Array.isArray(matchingCategory));

  if (!candidateMilestones.length) {
    return NextResponse.json(
      {
        status: 'FAILED',
        ageGroup,
        error:
          'No milestone-theme pairs are fully configured for this age group.',
      },
      { status: 500 }
    );
  }

  let authToken = '';
  try {
    authToken = await createE2ETestAuthSession(requestUrl);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'FAILED',
        ageGroup,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const results = [];

  for (const { milestone, selectedTheme, matchingCategory } of candidateMilestones) {
    const categoryThemes = matchingCategory[0]
      ? getThemesByCategory(ageGroup, matchingCategory[0])
      : [];
    const runId = buildRunId();
    const payload = {
      childName: `Test Child ${runId}`,
      childAge: getRepresentativeAge(ageGroup),
      theme: selectedTheme.value,
      tone: selectedTheme.storyTheme === 'milestone' ? 'gentle' : 'adventurous',
      pageCount: 6,
      milestoneTitle: milestone.title,
      milestonePromptHint: milestone.promptHint,
      milestoneCoverBadge: milestone.coverBadge,
    };

    const storyResponse = await fetch(storyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const storyJson = await storyResponse.json();
    const pageCount = Array.isArray(storyJson?.pages) ? storyJson.pages.length : 0;
    const generatedTitle = storyJson?.content?.title || '';
    const storyTheme = storyJson?.content?.theme || '';
    const categoryContainsTheme = categoryThemes.some(
      (theme) => theme.value === selectedTheme.value
    );

    results.push({
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      themeId: selectedTheme.value,
      themeLabel: selectedTheme.label,
      categoryKey: matchingCategory[0] || null,
      categoryName: matchingCategory[1]?.name || null,
      responseStatus: storyResponse.status,
      assertions: {
        requestSucceeded: storyResponse.ok,
        generatedPages: pageCount > 0,
        titleIncludesMilestone:
          generatedTitle.toLowerCase().includes(milestone.title.toLowerCase()),
        storyThemeMatchesSelection: storyTheme === selectedTheme.value,
        milestoneThemeAvailableInCategory: categoryContainsTheme,
      },
      generatedStory: {
        title: generatedTitle,
        pageCount,
      },
      error: storyResponse.ok ? null : storyJson,
    });
  }

  const passedResults = results.filter((result) =>
    Object.values(result.assertions).every(Boolean)
  );
  const allPassed = passedResults.length === results.length;

  return NextResponse.json(
    {
      status: allPassed ? 'SUCCESS' : 'FAILED',
      ageGroup,
      summary: {
        milestonesAvailable: milestones.length,
        milestonesTested: results.length,
        milestonesPassed: passedResults.length,
        milestonesSkipped: milestones.length - results.length,
      },
      results,
    },
    { status: allPassed ? 200 : 500 }
  );
}
