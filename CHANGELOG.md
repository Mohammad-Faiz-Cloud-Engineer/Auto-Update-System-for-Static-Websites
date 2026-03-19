# Changelog

All notable changes to this project.

## [1.0.0] - 2026-03-19

Initial release.

### Features

- Automatic update detection with configurable check intervals
- Smart cache management (online = fresh data, offline = cached)
- Beautiful update notifications with smooth animations
- Force update mode for critical fixes
- Manual update check functionality
- Version comparison with semantic versioning
- Comprehensive error handling and retry logic
- Debug mode for development
- Enable/disable toggle
- Callback hooks for custom behavior
- Cross-browser compatibility
- Zero dependencies
- Lightweight (<10KB)
- Security best practices (no eval, XSS protection)
- Mobile-responsive design
- Dark mode support
- Offline support

### Documentation

- Complete README with examples
- Integration guide with troubleshooting
- Automated test suite (45 tests)
- Example implementations
- Build script for version management

### Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support
- IE11: Partial support (no Service Worker)

---

## How to Update

When deploying a new version:

1. Update `version-manifest.json`:
   ```json
   {
     "version": "1.0.1",
     "timestamp": "2026-03-19T12:00:00Z"
   }
   ```

2. Or use the build script:
   ```bash
   node build-version.js patch
   ```

3. Deploy to your server

Users automatically get the update!
