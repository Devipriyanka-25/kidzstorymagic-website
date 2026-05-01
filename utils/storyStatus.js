export function getStoryId(story = {}) {
  return String(story.id || story.storyId || story.projectId || story.project_id || '');
}

export function isPaidOrPublishedStory(story = {}) {
  const status = String(story.status || '').toLowerCase();
  const paymentStatus = String(story.payment_status || story.paymentStatus || '').toLowerCase();

  return Boolean(
    story.isPaid ||
      story.is_paid ||
      story.paid_at ||
      story.published_pdf_url ||
      status === 'published' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'completed'
  );
}

export function isDashboardDraftStory(story = {}) {
  const status = String(story.status || 'draft').toLowerCase();
  const activeDraftStatuses = new Set(['draft', 'in_progress', 'pending']);

  return activeDraftStatuses.has(status) && !isPaidOrPublishedStory(story);
}

export function mergeUniqueStories(...storyLists) {
  const merged = [];
  const seen = new Set();

  storyLists.flat().forEach((story) => {
    const id = getStoryId(story);

    if (!id || seen.has(id)) {
      return;
    }

    seen.add(id);
    merged.push(story);
  });

  return merged;
}

export function storyMatchesDashboardFilters(
  story = {},
  { searchQuery = '', selectedTheme = 'all' } = {}
) {
  const normalizedSearch = String(searchQuery || '').trim().toLowerCase();
  const childName = String(story.child_name || story.childName || '').toLowerCase();
  const theme = String(story.theme || '').toLowerCase();
  const title = String(story.title || '').toLowerCase();
  const matchesSearch =
    !normalizedSearch ||
    childName.includes(normalizedSearch) ||
    theme.includes(normalizedSearch) ||
    title.includes(normalizedSearch);
  const matchesTheme = selectedTheme === 'all' || story.theme === selectedTheme;

  return matchesSearch && matchesTheme;
}
