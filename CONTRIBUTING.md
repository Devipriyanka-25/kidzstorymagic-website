# Contributing to Kidz Story Magic

Thank you for your interest in contributing to Kidz Story Magic! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Issues](#reporting-issues)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 13+
- Git

### Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/kidz-story-magic.git
   cd kidz-story-magic
   ```

2. **Install dependencies**
   ```bash
   make install
   # or
   cd frontend && npm install && cd ../backend && npm install
   ```

3. **Setup environment variables**
   ```bash
   cp backend/.env.example backend/.env.local
   cp frontend/.env.local.example frontend/.env.local
   ```

4. **Setup database**
   ```bash
   make setup-db
   ```

5. **Start development servers**
   ```bash
   make dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `docs/documentation-task` - Documentation
- `refactor/refactor-name` - Refactoring
- `test/test-name` - Tests

### Making Changes

1. Create a new branch
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes
3. Run tests and linting
   ```bash
   make test
   make lint
   ```

4. Commit your changes (see [Commit Guidelines](#commit-guidelines))
5. Push to your fork
6. Create a Pull Request

## Coding Standards

### Frontend (JavaScript/React)

- Use 2-space indentation
- Use functional components with hooks
- Component names in PascalCase
- Use meaningful variable names
- Add PropTypes or TypeScript types
- Extract reusable logic into custom hooks

Example:
```javascript
// ✅ Good
export default function StoryCard({ story, onDelete }) {
  return (
    <div className="card">
      <h3>{story.title}</h3>
      <button onClick={() => onDelete(story.id)}>Delete</button>
    </div>
  );
}

// ❌ Avoid
export default function sc({ s, od }) {
  return <div onClick={() => od(s.id)}>{s.t}</div>;
}
```

### Backend (Node.js/Express)

- Use 2-space indentation
- Use async/await instead of callbacks
- Add error handling for all async operations
- Use meaningful variable names
- Add JSDoc comments for functions
- Write unit tests for business logic

Example:
```javascript
// ✅ Good
/**
 * Create a new story project
 * @param {Object} data - Story data
 * @returns {Promise<Object>} Created story
 */
async function createStory(data) {
  try {
    const story = await Story.create(data);
    return story;
  } catch (error) {
    throw new Error(`Failed to create story: ${error.message}`);
  }
}

// ❌ Avoid
function createStory(data, callback) {
  Story.create(data, (err, story) => {
    callback(err, story);
  });
}
```

### General Guidelines

- Keep functions small and focused
- Write self-documenting code
- Add comments for complex logic only
- Use constants for magic numbers
- Follow DRY principle
- Keep files under 300 lines when possible

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change without feature or fix
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or dependencies

### Example

```bash
git commit -m "feat: add photo upload to wizard

- Added Step5PhotoUpload component
- Integrated image validation
- Added file preview
- Closes #123"
```

## Pull Request Process

1. **Before Submitting**
   - Run tests: `make test`
   - Run linting: `make lint`
   - Update documentation
   - Add tests for new features

2. **PR Description**
   - Clearly describe the changes
   - Reference related issues
   - Include before/after screenshots for UI changes
   - List any breaking changes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change

   ## Testing
   How have you tested these changes?

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

## Testing

### Run Tests

```bash
# All tests
make test

# Backend only
make test-backend

# Frontend only
make test-frontend

# Watch mode
cd backend && npm run test:watch
```

### Writing Tests

**Backend Example:**
```javascript
describe('User model', () => {
  it('should create a new user', async () => {
    const user = await User.create({
      name: 'John',
      email: 'john@example.com',
      password: 'password123'
    });
    expect(user.id).toBeDefined();
  });
});
```

**Frontend Example:**
```javascript
describe('StoryCard component', () => {
  it('should render story title', () => {
    const { getByText } = render(
      <StoryCard story={{ title: 'My Story' }} />
    );
    expect(getByText('My Story')).toBeInTheDocument();
  });
});
```

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable
- Environment details (OS, browser, Node version)

### Feature Requests

Include:
- Description of desired feature
- Why it's needed
- Possible implementation approach
- Any related issues or PRs

## Getting Help

- 📖 Check [Documentation](./docs)
- 💬 Ask in GitHub Discussions
- 📧 Email: dev@kidzstorymagic.com

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project website

Thank you for contributing to Kidz Story Magic! 🎉
