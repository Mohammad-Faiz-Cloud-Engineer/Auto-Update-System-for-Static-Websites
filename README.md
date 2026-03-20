# Auto-Update System for Static Websites

Ever deployed a fix to your website, only to have users complain it's still broken? They're seeing the old cached version. This library fixes that problem.

It automatically detects when you've deployed new code and forces browsers to download the latest version. No more "have you tried clearing your cache?" support tickets.

## The Problem

You push an update. Your server has the new files. But users are still seeing the old version because their browser cached everything. You tell them to hard refresh (Ctrl+F5), but half of them don't know what that means.

Sound familiar?

## The Solution

This library checks your server every 30 seconds for a new version. When it finds one, it clears all the browser caches and reloads the page. Users get the update automatically. Done.

## Quick Start

Download two files:
- `auto-update.js` - the library
- `version-manifest.json` - tracks your version

Put them in your website's root folder and add this to your HTML:

```html
<script src="auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json'
  });
</script>
```

Set your version in `version-manifest.json`:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260319001",
  "timestamp": "2026-03-19T10:00:00Z"
}
```

Upload everything. You're done.

## Deploying Updates

When you make changes:

1. Edit your files
2. Change the version in `version-manifest.json` (1.0.0 → 1.0.1)
3. Upload to your server

Users automatically get the update within 30 seconds.

If you have Node.js, there's a script to bump versions automatically:

```bash
node build-version.js patch  # 1.0.0 → 1.0.1
node build-version.js minor  # 1.0.0 → 1.1.0
node build-version.js major  # 1.0.0 → 2.0.0
```

## Configuration

Basic setup:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,  // check every 30 seconds
  forceUpdate: true      // auto-reload when update found
});
```

Let users decide when to update:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: false,        // don't auto-reload
  showNotification: true     // show a notification instead
});
```

Development mode (more frequent checks, debug logs):

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 10000,
  forceUpdate: false,
  debug: true
});
```

All available options:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,
  forceUpdate: true,
  showNotification: true,
  debug: false,
  notificationMessage: 'New version available!',
  retryAttempts: 3,
  retryDelay: 5000,
  
  onUpdateAvailable: (newVersion, oldVersion) => {
    console.log(`Update: ${oldVersion} → ${newVersion}`);
  },
  
  onUpdateComplete: (version) => {
    console.log(`Now running ${version}`);
  },
  
  onError: (error) => {
    console.error('Update check failed:', error);
  }
});
```

## Real Examples

**E-commerce site with a critical bug fix:**

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: true  // force reload immediately
});
```

Deploy the fix, bump the version, and all users get it within 30 seconds.

**Documentation site:**

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: false,  // let users finish reading
  notificationMessage: 'New docs available. Update when ready.'
});
```

**With analytics:**

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: (newVersion, oldVersion) => {
    gtag('event', 'update_available', {
      old_version: oldVersion,
      new_version: newVersion
    });
  }
});
```

## Testing

Open your site in a browser. Open the console (F12). Edit `version-manifest.json` on your server and change the version. Wait 30 seconds. You'll see the update notification or the page will reload.

Or add a button to test manually:

```html
<button onclick="AutoUpdate.checkNow()">Check for Updates</button>
```

Show the current version on your page:

```html
<div id="version"></div>
<script>
  document.getElementById('version').textContent = 
    'Version: ' + AutoUpdate.getVersion();
</script>
```

Run the automated test suite:

```bash
npm test
```

## How It Works

When your page loads, the script stores the current version in localStorage. Every 30 seconds, it fetches `version-manifest.json` from your server (with cache-busting headers so it always gets the latest). If the version changed, it clears all browser caches (Cache API, Service Workers, localStorage, sessionStorage) and reloads the page.

## Important: Server Configuration

The library handles client-side caching perfectly. But if your server or CDN is caching the manifest file, users won't get updates.

You need to configure your server to never cache `version-manifest.json`:

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

For HTML files, use a short cache:

```
Cache-Control: public, max-age=300, must-revalidate
```

For CSS/JS files, use a long cache with versioned URLs:

```
Cache-Control: public, max-age=31536000, immutable
```

Then use URLs like `app.js?v=1.0.1` or `app.v1.0.1.js`.

See `SERVER_CACHE_CONFIG.md` for complete examples for Apache, Nginx, Node.js, Python, and all major CDNs (Cloudflare, AWS, Netlify, Vercel).

## Browser Support

Works in all modern browsers. Partial support for IE11 (no Service Worker).

## Troubleshooting

**Updates not detected?**
- Check the browser console for errors
- Make sure the `manifestUrl` path is correct
- Verify the version number actually changed
- Enable debug mode: `debug: true`

**Notification not showing?**
- Set `forceUpdate: false` and `showNotification: true`
- Check for CSS conflicts (notification uses z-index: 999999)

**Page reloading constantly?**
- Check version format: `"1.0.0"` not `"1.0"`
- Clear localStorage: `localStorage.clear()` in console

**Works locally but not on server?**
- Use absolute paths: `/version-manifest.json`
- Make sure HTTPS is enabled (required for Service Workers)
- Check server CORS settings if manifest is on a different domain

## Advanced Usage

```javascript
AutoUpdate.disable();   // stop checking
AutoUpdate.enable();    // resume checking
AutoUpdate.checkNow();  // check immediately
AutoUpdate.getVersion(); // get current version
AutoUpdate.isEnabled(); // check if enabled
```

## Security

No `eval()` or dynamic code execution. All inputs are validated and sanitized. Works with Content Security Policy. HTTPS recommended. No external dependencies. SHA-256 file hashing. Timeout protection. Race condition protection. Memory leak prevention.

See `SECURITY.md` for details and advanced features like manifest signing.

## Performance

Library size: <10KB. Network overhead: ~1KB per check. Memory usage: <1MB. No impact on page load time.

## Build Tool Integration

**GitHub Actions:**

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Bump version
        run: node build-version.js patch
      - name: Deploy
        run: rsync -avz ./ user@server:/var/www/html/
```

**Webpack/Vite:**

```json
{
  "scripts": {
    "build": "vite build && node build-version.js patch"
  }
}
```

## FAQ

**Do I need Node.js?**  
No. The library is pure JavaScript. Node.js is only for the optional build script.

**Does it work with WordPress/Joomla?**  
Yes. Works with any website. Just add the script to your theme.

**Will it work offline?**  
Yes. When offline, it serves cached content. When back online, it checks for updates.

**Can I customize the notification?**  
Yes. Set `showNotification: false` and use the `onUpdateAvailable` callback.

**Is it free?**  
Yes. MIT License.

**How big is it?**  
Less than 10KB.

## Contributing

Found a bug? Open an issue. Want to add a feature? Submit a PR.

## License

MIT - do whatever you want with it.

## Credits

Built by [Mohammad Faiz](https://github.com/Mohammad-Faiz-Cloud-Engineer)

If this saved you time, star it on GitHub.

---

Made for developers tired of cache issues.
