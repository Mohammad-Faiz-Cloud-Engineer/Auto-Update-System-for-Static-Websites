# Auto-Update System for Static Websites

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites)

Ever deployed a website update only to have users still see the old cached version? This solves that problem.

This is a lightweight JavaScript library that automatically detects when you've deployed new code and forces browsers to download the latest version. No more "clear your cache" support tickets.

## Why This Exists

Browser caching is great for performance but terrible when you need users to see your latest changes. Traditional solutions like cache-busting URLs or service workers are complex to implement. This library gives you automatic updates with just two files and five lines of code.

## What It Does

- Checks your server every 30 seconds for a new version
- When found, clears all browser caches automatically
- Shows users a clean notification (or force-reloads the page)
- Works offline - serves cached content when there's no connection
- Zero dependencies, works with any static site

## Quick Start

### 1. Download Files

Grab these two files from this repo:
- `auto-update.js` - The main library (20KB)
- `version-manifest.json` - Tracks your version number

### 2. Add to Your Project

Put both files in your website's root folder:

```
your-website/
├── index.html
├── css/
├── js/
├── auto-update.js          ← Add this
└── version-manifest.json   ← Add this
```

### 3. Add Script to HTML

Open your HTML file and add this before the closing `</body>` tag:

```html
<script src="auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json'
  });
</script>
```

### 4. Set Your Version

Edit `version-manifest.json`:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260319001",
  "timestamp": "2026-03-19T10:00:00Z"
}
```

That's it. Upload everything to your server and you're done.

## How to Deploy Updates

When you make changes to your website:

1. **Edit your files** (HTML, CSS, JS, whatever)

2. **Bump the version** in `version-manifest.json`:
   ```json
   {
     "version": "1.0.1",  ← Change this
     "timestamp": "2026-03-19T11:00:00Z"
   }
   ```

3. **Upload to your server**

Users will automatically get the update within 30 seconds. No manual cache clearing needed.

### Automated Version Bumping

If you have Node.js installed, use the included script:

```bash
node build-version.js patch  # 1.0.0 → 1.0.1
node build-version.js minor  # 1.0.0 → 1.1.0
node build-version.js major  # 1.0.0 → 2.0.0
```

This updates the version, generates a build number, and calculates file hashes automatically.

## Configuration

### Basic Setup

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,  // Check every 30 seconds
  forceUpdate: true      // Auto-reload when update found
});
```

### Show Notification Instead

Let users decide when to update:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: false,        // Don't auto-reload
  showNotification: true     // Show update prompt
});
```

### Development Mode

More frequent checks and debug logging:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 10000,  // Check every 10 seconds
  forceUpdate: false,
  debug: true            // See console logs
});
```

### All Options

```javascript
AutoUpdate.init({
  // Required
  manifestUrl: '/version-manifest.json',
  
  // Optional
  checkInterval: 30000,              // How often to check (ms)
  forceUpdate: true,                 // Auto-reload on update
  showNotification: true,            // Show update notification
  debug: false,                      // Console logging
  notificationMessage: 'New version available!',
  retryAttempts: 3,                  // Retry failed checks
  retryDelay: 5000,                  // Delay between retries
  
  // Callbacks
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

## Real-World Examples

### Example 1: E-commerce Site

You fix a critical checkout bug. Deploy the fix, bump the version, and all users get it within 30 seconds. No support tickets about "the checkout still doesn't work."

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: true  // Critical fix, force reload
});
```

### Example 2: Documentation Site

You update docs frequently. Let users finish reading before updating:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: false,
  notificationMessage: 'New documentation available. Update when ready.'
});
```

### Example 3: With Analytics

Track how many users are updating:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: (newVersion, oldVersion) => {
    // Send to Google Analytics
    gtag('event', 'update_available', {
      old_version: oldVersion,
      new_version: newVersion
    });
  },
  onUpdateComplete: (version) => {
    gtag('event', 'update_completed', { version });
  }
});
```

## Testing

### Test Update Detection

1. Open your website in a browser
2. Open browser console (F12)
3. Edit `version-manifest.json` on your server - change version to `1.0.1`
4. Wait 30 seconds
5. You'll see the update notification or page will reload

### Manual Check

Add a button to test manually:

```html
<button onclick="AutoUpdate.checkNow()">Check for Updates</button>
```

### Show Current Version

Display version on your page:

```html
<div id="version"></div>

<script>
  document.getElementById('version').textContent = 
    'Version: ' + AutoUpdate.getVersion();
</script>
```

### Run Automated Tests

```bash
npm test
```

Runs 45 tests covering file structure, code quality, security, and functionality.

## How It Works

1. **Initialization**: When your page loads, the script stores the current version in localStorage
2. **Periodic Checks**: Every 30 seconds (configurable), it fetches `version-manifest.json` from your server
3. **Version Comparison**: Compares server version with stored version
4. **Cache Clearing**: If different, clears all browser caches (Cache API, Service Worker)
5. **Update**: Reloads the page with cache bypass, forcing fresh content download

The manifest is fetched with cache-busting query parameters and no-cache headers to ensure you always get the latest version number.

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Edge    | ✅ Full |
| Opera   | ✅ Full |
| IE11    | ⚠️ Partial (no Service Worker) |

## Troubleshooting

### Updates Not Detected

**Problem**: Changed version but nothing happens

**Solutions**:
- Check browser console for errors
- Verify `manifestUrl` path is correct
- Make sure version number actually changed
- Enable debug mode: `debug: true`

### Notification Not Showing

**Problem**: Update detected but no notification appears

**Solutions**:
- Set `forceUpdate: false` and `showNotification: true`
- Check for CSS conflicts (notification uses z-index: 999999)
- Look for JavaScript errors in console

### Page Reloads Constantly

**Problem**: Page keeps reloading in a loop

**Solutions**:
- Check version format is correct: `"1.0.0"` not `"1.0"`
- Clear localStorage: `localStorage.clear()` in console
- Verify manifest file is valid JSON

### Works Locally But Not on Server

**Problem**: Everything works on localhost but fails in production

**Solutions**:
- Use absolute paths: `/version-manifest.json` not `../version-manifest.json`
- Ensure HTTPS is enabled (required for Service Workers)
- Check server CORS settings if manifest is on different domain
- Verify JSON file has correct MIME type (application/json)

## Advanced Usage

### Disable Auto-Update Temporarily

```javascript
AutoUpdate.disable();  // Stop checking
AutoUpdate.enable();   // Resume checking
```

### Check If Enabled

```javascript
if (AutoUpdate.isEnabled()) {
  console.log('Auto-update is active');
}
```

### Get Current Version

```javascript
const version = AutoUpdate.getVersion();
console.log('Running version:', version);
```

### Manual Update

```javascript
AutoUpdate.checkNow();      // Check for updates now
AutoUpdate.applyUpdate();   // Force update immediately
```

## Security

- No `eval()` or dynamic code execution
- All user inputs are sanitized
- XSS protection built-in
- Works with Content Security Policy (CSP)
- HTTPS recommended for production
- No external dependencies (no supply chain attacks)

## Performance

- Library size: <10KB unminified
- Network overhead: ~1KB per check (manifest only)
- Memory usage: <1MB
- CPU usage: Negligible
- No impact on page load time

## Integration with Build Tools

### GitHub Actions

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
        run: |
          # Your deployment command
          rsync -avz ./ user@server:/var/www/html/
```

### With Webpack/Vite

Add to your build script:

```json
{
  "scripts": {
    "build": "vite build && node build-version.js patch"
  }
}
```

## FAQ

**Q: Do I need Node.js?**  
A: No. The library is pure JavaScript. Node.js is only needed for the optional build script.

**Q: Does it work with WordPress/Joomla/etc?**  
A: Yes. Works with any website that serves HTML. Just add the script to your theme.

**Q: Will it work offline?**  
A: Yes. When offline, it serves cached content. When back online, it checks for updates.

**Q: Can I customize the notification?**  
A: Yes. Set `showNotification: false` and use the `onUpdateAvailable` callback to show your own UI.

**Q: Does it work on mobile?**  
A: Yes. Fully responsive and mobile-friendly.

**Q: Is it free?**  
A: Yes. MIT License - free for personal and commercial use.

**Q: How big is it?**  
A: Less than 10KB unminified. Very lightweight.

**Q: Can I use it with a CDN?**  
A: Yes. Just point `manifestUrl` to your CDN URL.

## Contributing

Found a bug? Have a feature request? Open an issue on GitHub.

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

MIT License - see [LICENSE](LICENSE) file for details.

Free to use in personal and commercial projects.

## Credits

Built by [Mohammad Faiz](https://github.com/Mohammad-Faiz-Cloud-Engineer)

If this saved you time, consider giving it a star on GitHub!

## Support

- 🐛 [Report Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites/issues)
- 💬 [Discussions](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites/discussions)
- 📧 Email: mohammadfaiz.cloudeng@gmail.com

---

**Made for developers who are tired of cache issues.**
