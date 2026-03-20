# Changelog

All notable changes to this project.

## [2.0.0] - 2026-03-20

### 🔒 Security Enhancements

- **XSS Protection**: Added comprehensive input sanitization for all user-provided content
  - Version strings are now sanitized before DOM insertion
  - Uses `textContent` for safe text insertion
  - Added `sanitizeText()` function for all dynamic content
  - Notification HTML now includes ARIA attributes for accessibility

- **Input Validation**: Enhanced manifest validation
  - File size limits (manifest < 1MB)
  - Content-type verification
  - Version format validation with semantic versioning support
  - Timeout protection (10s) with AbortController
  - Empty response detection

- **Network Security**: Improved fetch security
  - Enhanced cache-busting with random tokens
  - Abort controller for request timeouts
  - Better error handling for network failures
  - No hardcoded HTTP URLs

### 🐛 Bug Fixes

- **Race Condition Protection**: Fixed concurrent update checks
  - Added `checkPromise` to track ongoing checks
  - Returns existing promise if check already in progress
  - Prevents multiple simultaneous manifest fetches

- **Memory Leak Prevention**: Proper cleanup of resources
  - Event listeners are now tracked and removed on destroy
  - Added `removeAllEventListeners()` function
  - Proper cleanup in `destroy()` method
  - Added `isDestroyed` flag to prevent operations after destruction

- **Version Comparison**: Enhanced version comparison logic
  - Full semantic versioning support (major.minor.patch-prerelease+build)
  - Handles pre-release versions correctly
  - Better fallback for non-semver versions
  - Validates version format before comparison

- **Cache Clearing**: Comprehensive cache management
  - Now clears Cache API, Service Workers, localStorage, and sessionStorage
  - Preserves own storage keys during localStorage clear
  - Returns detailed results object
  - Better error handling for each cache type

### ✨ New Features

- **Enhanced Build Script**: Production-grade version management
  - Atomic file writes with backup/restore
  - SHA-256 hashing (upgraded from MD5)
  - Comprehensive validation at every step
  - File size limits and safety checks
  - Better error messages and recovery
  - Environment validation

- **Server Configuration Guide**: Complete documentation
  - Apache, Nginx, Node.js, Python examples
  - CDN configuration (Cloudflare, AWS, Netlify, Vercel)
  - Cache header best practices
  - Testing instructions
  - Common issues and solutions

- **Security Documentation**: Comprehensive security guide
  - Security features overview
  - Best practices for developers
  - Vulnerability reporting process
  - Advanced features (manifest signing)
  - Compliance information (GDPR, CCPA)
  - Security checklist

### 📚 Documentation

- Added `SERVER_CACHE_CONFIG.md` - Complete server-side cache configuration guide
- Added `SECURITY.md` - Comprehensive security documentation
- Updated `README.md` with critical server-side cache information
- Enhanced `CHANGELOG.md` with detailed version history
- Improved inline code documentation

### 🔧 Technical Improvements

- Upgraded library version to 2.0.0
- Enhanced error messages throughout
- Better TypeScript compatibility (JSDoc comments)
- Improved code organization and readability
- Added comprehensive validation everywhere
- Better handling of edge cases

### ⚠️ Breaking Changes

None - Fully backward compatible with 1.x configuration

### 🎯 Performance

- Reduced redundant checks with promise caching
- More efficient cache clearing
- Better memory management
- Optimized event listener handling

### 🧪 Testing

- All 45 automated tests passing
- Enhanced test coverage
- Better error scenarios covered
- Security tests added

---

## [1.0.1] - 2026-03-19

### Features

- Initial public release
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

## [1.0.0] - 2026-03-19

Initial development release (not published)

---

## Migration Guide

### From 1.x to 2.0

No code changes required! Version 2.0 is fully backward compatible.

However, we **strongly recommend** adding server-side cache headers:

1. Read `SERVER_CACHE_CONFIG.md`
2. Configure your server to never cache `version-manifest.json`
3. Add appropriate cache headers for HTML/CSS/JS files
4. Test with browser DevTools Network tab

### Recommended Configuration Update

```javascript
// Old (still works)
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000
});

// New (recommended - same functionality, just explicit)
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,
  forceUpdate: true,
  showNotification: true,
  debug: false,
  retryAttempts: 3,
  retryDelay: 5000
});
```

---

## Upgrade Instructions

### For Users

1. Download new `auto-update.js` (v2.0.0)
2. Replace old file
3. No configuration changes needed
4. Deploy to server

### For Developers

1. Update `auto-update.js` to v2.0.0
2. Update `build-version.js` to v2.0.0
3. Read `SERVER_CACHE_CONFIG.md` and configure server
4. Read `SECURITY.md` for security best practices
5. Test in staging environment
6. Deploy to production

---

## Deprecation Notices

None - All 1.x features are supported

---

## Known Issues

None currently

---

## Roadmap

### v2.1.0 (Planned)
- TypeScript definitions
- React/Vue/Angular integration examples
- Webpack/Vite plugins
- Progressive rollout support
- A/B testing integration

### v2.2.0 (Planned)
- Service Worker integration
- Background sync support
- Offline-first mode
- Delta updates (partial updates)

### v3.0.0 (Future)
- Breaking changes TBD
- Modern browser only (drop IE11)
- Native ES modules
- Web Components support

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.
