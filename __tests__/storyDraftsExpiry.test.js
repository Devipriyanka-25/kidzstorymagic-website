jest.mock('@/app/api/shared/storyProjects.js', () => ({
  createStoryProjectRecord: jest.fn(),
  deleteStoryProjectRecord: jest.fn(),
  getStoryProjectById: jest.fn(),
  listStoryProjectPages: jest.fn(),
  listStoryProjectsByUser: jest.fn(),
  replaceStoryProjectPages: jest.fn(),
  updateStoryProjectRecord: jest.fn(),
}));

const storyProjects = require('@/app/api/shared/storyProjects.js');
const {
  DRAFT_TTL_MS,
  getLatestDraftForUser,
  saveDraftForUser,
} = require('@/app/api/shared/storyDrafts.js');

describe('storyDrafts expiry cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes expired drafts before returning the latest active draft', async () => {
    const now = Date.now();
    const expiredDraft = {
      id: '11',
      status: 'draft',
      updatedAt: new Date(now - DRAFT_TTL_MS - 1000).toISOString(),
      photo_metadata: {
        draftFlow: {
          isActive: true,
        },
      },
    };
    const freshDraft = {
      id: '12',
      status: 'draft',
      child_name: 'Asha',
      page_count: 10,
      updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
      photo_metadata: {
        draftFlow: {
          isActive: true,
        },
      },
    };

    storyProjects.listStoryProjectsByUser.mockResolvedValue({
      projects: [expiredDraft, freshDraft],
    });
    storyProjects.deleteStoryProjectRecord.mockResolvedValue(expiredDraft);
    storyProjects.listStoryProjectPages.mockResolvedValue([]);

    const result = await getLatestDraftForUser(7);

    expect(storyProjects.deleteStoryProjectRecord).toHaveBeenCalledWith(7, '11');
    expect(result.id).toBe('12');
  });

  it('creates a new draft when the requested one already expired', async () => {
    const now = Date.now();
    const expiredDraft = {
      id: '21',
      status: 'draft',
      updatedAt: new Date(now - DRAFT_TTL_MS - 1000).toISOString(),
      photo_metadata: {
        draftFlow: {
          isActive: true,
        },
      },
    };
    const replacementDraft = {
      id: '22',
      status: 'draft',
      child_name: 'Nila',
      page_count: 10,
      updatedAt: new Date(now).toISOString(),
      photo_metadata: {
        draftFlow: {
          isActive: true,
        },
      },
    };

    storyProjects.getStoryProjectById
      .mockResolvedValueOnce(expiredDraft)
      .mockResolvedValueOnce(replacementDraft);
    storyProjects.deleteStoryProjectRecord.mockResolvedValue(expiredDraft);
    storyProjects.createStoryProjectRecord.mockResolvedValue(replacementDraft);
    storyProjects.listStoryProjectPages.mockResolvedValue([]);

    const result = await saveDraftForUser(9, {
      projectId: '21',
      step: 1,
      formData: {
        childName: 'Nila',
        theme: 'space',
      },
    });

    expect(storyProjects.deleteStoryProjectRecord).toHaveBeenCalledWith(9, '21');
    expect(storyProjects.createStoryProjectRecord).toHaveBeenCalled();
    expect(result.id).toBe('22');
  });
});
