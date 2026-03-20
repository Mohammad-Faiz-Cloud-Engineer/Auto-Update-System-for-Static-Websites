# Contributing

Thanks for wanting to help out! Here's how you can contribute.

## Found a Bug?

Open an issue and include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and version

Example:
```
Expected: Page reloads after update
Actual: Nothing happens
Steps: 1. Deploy new version 2. Wait 30 seconds 3. Nothing
Browser: Chrome 120
```

## Have an Idea?

Open an issue with:
- What problem it solves
- How you'd use it
- Any alternatives you considered

We're open to new ideas but keep in mind this library is meant to be simple.

## Want to Submit Code?

### Setup

```bash
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites.git
cd Auto-Update-System-for-Static-Websites
npm install
```

### Make Changes

1. Create a branch: `git checkout -b fix-something`
2. Make your changes
3. Test: `npm run test:all`
4. Commit: `git commit -m "Fix something"`
5. Push: `git push origin fix-something`
6. Open a pull request

### Code Style

- Use ES6+ features
- Add JSDoc comments for functions
- No eval() or Function() constructor
- Handle errors properly
- Keep it simple

### Testing

All tests must pass:

```bash
npm run test:all
```

Add tests for new features.

### Documentation

Update the README if you:
- Add a new feature
- Change how something works
- Add new configuration options

## Questions?

Open an issue with the "question" label. We're happy to help.

## Code of Conduct

Be nice. That's it.

## License

By contributing, you agree your code will be licensed under MIT.
