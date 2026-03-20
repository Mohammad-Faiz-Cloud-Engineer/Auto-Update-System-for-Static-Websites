# Changelog

## Version 2.1.0 (March 20, 2026)

This release adds framework integrations, TypeScript support, build tool plugins, and progressive rollout capabilities.

### New Features

**TypeScript Definitions**  
Added complete TypeScript definitions (`auto-update.d.ts`) with full type safety for all configuration options, callbacks, and methods. Works with TypeScript, VS Code IntelliSense, and other editors.

**Framework Integrations**  
Created ready-to-use integration examples:

- React: Custom hook (`useAutoUpdate`) with full React lifecycle support
- Vue: Component with Options API and Composition API examples
- Angular: Service with RxJS observables and dependency injection

All examples include update notifications, version display, and manual check triggers.

**Build Tool Plugins**  
Automatic manifest generation during build:

- Webpack plugin: Generates manifest with file hashes automatically
- Vite plugin: Same functionality for Vite projects

No more manual version bumping - the plugins handle it during your build process.

**Progressive Rollout**  
New `rolloutPercentage` option lets you update only a percentage of users:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  rolloutPercentage: 0.1  // Update 10% of users
});
```

Each user gets a stable ID, so they consistently either get or don't get the update. Perfect for testing new versions with a subset of users before full rollout.

### How It Works

The progressive rollout uses a hash of a randomly generated user ID stored in localStorage. If the hash is less than your rollout percentage, that user gets the update. The ID persists across sessions, so users don't randomly switch between getting and not getting updates.

### Examples

All new examples are in the `examples/` folder:
- `react-integration.jsx` - React hooks and components
- `vue-integration.vue` - Vue 2/3 compatible
- `angular-integration.ts` - Angular service and components

Plugins are in the `plugins/` folder:
- `webpack-plugin.js` - Webpack integration
- `vite-plugin.js` - Vite integration

### Breaking Changes

None. All v2.0 code works without changes.

---

## Version 2.0.0 (March 20, 2026)

This release focuses on production readiness, security hardening, and fixing some annoying bugs that could cause issues in real-world deployments.

### What's Fixed

**Memory leaks are gone**  
The library was adding event listeners but never cleaning them up. If you had a long-running single-page app, this would eventually cause problems. Now all listeners are tracked and properly removed when you call `destroy()`.

**Race conditions in update checks**  
If multiple update checks happened at the same time (which could happen if you manually triggered a check while the automatic one was running), things got messy. Now we track the ongoing check and just return the same promise if another check is requested.

**Cache clearing was incomplete**  
We were only clearing the Cache API and Service Workers, but localStorage and sessionStorage were left alone. Now we clear everything (except our own data in localStorage, obviously).

**Version comparison was broken for pre-releases**  
If you used versions like `1.0.0-beta.1`, the comparison logic would fail. Now it properly handles semantic versioning including pre-release tags and build metadata.

### Security Improvements

**XSS protection**  
Version strings from the manifest are now sanitized before being inserted into the DOM. If someone managed to inject malicious code into your manifest file, it won't execute anymore.

**Better input validation**  
The manifest is now thoroughly validated - we check file sizes, content types, version formats, and handle timeouts properly. No more crashes from malformed data.

**Request timeouts**  
Added a 10-second timeout for manifest fetches using AbortController. If your server is slow or unresponsive, the library won't hang forever.

### New Stuff

**Server configuration guide**  
This was the big missing piece. The library handles client-side caching perfectly, but if your server or CDN is caching the manifest file, users won't get updates. I wrote a complete guide (`SERVER_CACHE_CONFIG.md`) with examples for Apache, Nginx, Node.js, Python, and all major CDNs.

**Security documentation**  
Added `SECURITY.md` with best practices, vulnerability reporting process, and even an example of how to implement manifest signing if you need that level of security.

**Better build script**  
The version bumping script now uses atomic writes (so you won't corrupt your manifest if something goes wrong), switched from MD5 to SHA-256 for file hashing, and validates everything before writing.

### Technical Details

The library version is now `2.0.0` (was `1.0.0`). All 45 automated tests still pass. No breaking changes - your existing code will work without modifications.

Performance is slightly better due to promise caching and more efficient cache clearing. Memory usage is lower thanks to proper cleanup.

### What You Should Do

If you're upgrading from 1.x:

1. Replace `auto-update.js` with the new version
2. **Important**: Configure your server to never cache `version-manifest.json` (see `SERVER_CACHE_CONFIG.md`)
3. Test in staging
4. Deploy

That's it. Your existing configuration will work as-is.

---

## Version 1.0.1 (March 19, 2026)

Initial public release. This is the version that was working but had the issues fixed in 2.0.0.

Features:
- Automatic update detection every 30 seconds (configurable)
- Clears browser caches when updates are found
- Shows a nice notification or auto-reloads the page
- Works offline (serves cached content)
- Retry logic for failed checks
- Debug mode
- Callbacks for custom behavior
- Works in all modern browsers (partial support for IE11)

---

## Version 1.0.0 (March 19, 2026)

Internal development version, never released publicly.

---

## Upgrading from 1.x to 2.0

Good news: no code changes needed. Just swap the files and you're done.

The only thing you *should* do (but technically don't have to) is configure your server to send proper cache headers for the manifest file:

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

Without this, browsers and CDNs might cache the manifest, and users won't get updates immediately. See `SERVER_CACHE_CONFIG.md` for details.

---

## What's Next

**Version 2.1** (planned for Q2 2026):
- TypeScript definitions
- Framework integration examples (React, Vue, Angular)
- Webpack and Vite plugins
- Progressive rollout (update only X% of users)

**Version 2.2** (planned for Q3 2026):
- Better Service Worker integration
- Background sync support
- Offline-first mode
- Delta updates (only download what changed)

**Version 3.0** (someday):
- Drop IE11 support
- Native ES modules
- Modern browser features only

---

## Contributing

Found a bug? Have an idea? Open an issue or submit a PR. See CONTRIBUTING.md for guidelines.

## License

MIT - do whatever you want with it.
