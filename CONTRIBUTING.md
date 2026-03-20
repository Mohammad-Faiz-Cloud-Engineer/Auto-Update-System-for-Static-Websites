# Contributing

Thanks for considering contributing to this project. Here's how to help.

## Reporting Bugs

Found a bug? Open an issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and version
- Any error messages from the console

Example:

```
**Expected:** Update notification should appear
**Actual:** Nothing happens
**Steps:** 
1. Changed version in manifest from 1.0.0 to 1.0.1
2. Waited 60 seconds
3. No notification appeared
**Browser:** Chrome 120
**Console errors:** None
```

## Suggesting Features

Have an idea? Open an issue and describe:

- What problem it solves
- How you'd use it
- Any alternatives you considered

Keep it focused. "Add TypeScript support" is better than "make it better."

## Submitting Code

### Before You Start

For small fixes (typos, bugs), just submit a PR. For bigger changes, open an issue first to discuss it. Saves everyone time if the approach needs adjustment.

### Development Setup

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites.git
cd Auto-Update-System-for-Static-Websites
```

No dependencies to install. It's vanilla JavaScript.

### Making Changes

1. Create a branch: `git checkout -b fix-race-condition`
2. Make your changes
3. Test them (see below)
4. Commit with a clear message: `git commit -m "Fix race condition in update checks"`
5. Push: `git push origin fix-race-condition`
6. Open a PR

### Testing

Run the test suite:

```bash
npm test
```

All 45 tests should pass. If you added new functionality, add tests for it.

Manual testing:

1. Open `test/index.html` in a browser
2. Click "Run All Tests"
3. Check that everything passes
4. Test your specific change manually

### Code Style

Keep it simple and readable. Match the existing style:

- Use semicolons
- 2 spaces for indentation
- Clear variable names
- Comments for non-obvious code
- No external dependencies

Good:

```javascript
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}
```

Bad:

```javascript
function st(t){return document.createElement('div').textContent=String(t),div.innerHTML}
```

### Commit Messages

Write clear commit messages:

- First line: short summary (50 chars or less)
- Blank line
- Detailed explanation if needed

Good:

```
Fix memory leak in event listeners

Event listeners were added but never removed, causing memory
to grow over time in long-running SPAs. Now tracking all
listeners and removing them in destroy().
```

Bad:

```
fixed stuff
```

### Pull Request Guidelines

- One feature/fix per PR
- Update tests if needed
- Update documentation if needed
- Keep PRs focused and small
- Respond to review feedback

PR description should explain:

- What changed
- Why it changed
- How to test it

Example:

```markdown
## What Changed
Added timeout protection for manifest fetches using AbortController

## Why
Manifest fetches could hang indefinitely if the server was slow,
blocking the update check process.

## How to Test
1. Run test suite (npm test)
2. Manually test with slow network throttling in DevTools
3. Verify timeout triggers after 10 seconds
```

## Documentation

If you change functionality, update the docs:

- `README.md` - main documentation
- `CHANGELOG.md` - add entry for your change
- Inline comments - explain complex code
- `SECURITY.md` - if security-related

## Security Issues

Found a security vulnerability? Don't open a public issue. Email the maintainer directly (see SECURITY.md for contact info).

## Questions

Not sure about something? Open an issue with the "question" label. Better to ask than guess.

## Code of Conduct

Be respectful. We're all here to build something useful. No harassment, no spam, no trolling.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are listed in the README. If you make a significant contribution, you'll be added.

## What We're Looking For

Help is especially welcome in these areas:

- Bug fixes
- Performance improvements
- Better error messages
- Documentation improvements
- Test coverage
- Browser compatibility fixes
- Security enhancements

Not looking for:

- Major rewrites without discussion
- Adding dependencies
- Breaking changes without good reason
- Style-only changes

## Getting Help

Stuck? Open an issue or discussion. We'll help you out.

---

Thanks for contributing!
