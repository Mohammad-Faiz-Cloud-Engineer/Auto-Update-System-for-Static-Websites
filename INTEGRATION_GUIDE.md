# Integration Guide

Complete instructions for adding auto-updates to your website.

## Prerequisites

- A static HTML/CSS/JS website
- Access to your web server
- 5 minutes

## Installation

### Step 1: Download Files

Download these files from the repository:
- `auto-update.js`
- `version-manifest.json`

### Step 2: Add to Your Project

Place both files in your website's root directory:

```
your-website/
├── index.html
├── css/
├── js/
├── auto-update.js          ← Add here
└── version-manifest.json   ← Add here
```

### Step 3: Configure Version Manifest

Edit `version-manifest.json` and set your starting version:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260319001",
  "timestamp": "2026-03-19T10:00:00Z",
  "description": "Initial release"
}
```

### Step 4: Add Script to HTML

Add this code to **all your HTML files** before the closing `</body>` tag:

```html
<!-- Auto-Update System -->
<script src="auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000,
    forceUpdate: true,
    debug: false
  });
</script>
```

### Step 5: Upload to Server

Upload all files to your web server. Done!

## Configuration

### Development Environment

Use these settings while developing:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 10000,  // Check more frequently
  forceUpdate: false,    // Don't auto-reload
  debug: true            // See what's happening
});
```

### Production Environment

Use these settings for production:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 60000,  // Check every minute
  forceUpdate: true,     // Auto-reload on update
  debug: false           // No console logs
});
```

## Deploying Updates

### Manual Method

When you update your website:

1. Make your changes (edit HTML, CSS, JS, etc.)
2. Edit `version-manifest.json`:
   ```json
   {
     "version": "1.0.1",  ← Increment this
     "timestamp": "2026-03-19T11:00:00Z"
   }
   ```
3. Upload all files to your server

Users will get the update automatically.

### Automated Method

If you have Node.js:

```bash
# Make your changes first, then:
node build-version.js patch  # Bumps version automatically
# Upload files to server
```

## Testing

### Test 1: Verify Installation

1. Open your website
2. Press F12 to open browser console
3. Look for: `[AutoUpdate] System initialized successfully`

If you see this, installation worked!

### Test 2: Test Update Detection

1. Keep your browser open on your website
2. Edit `version-manifest.json` on your server
3. Change version from `1.0.0` to `1.0.1`
4. Wait 30 seconds
5. You should see an update notification or page reload

### Test 3: Manual Check

Add a test button:

```html
<button onclick="AutoUpdate.checkNow()">Check for Updates</button>
```

Click it to trigger an immediate check.

## Troubleshooting

### Updates Not Detected

**Check these:**
- Is the manifest URL correct?
- Did you actually change the version number?
- Is your server running?
- Any errors in browser console?

**Solution:**
```javascript
// Enable debug mode to see what's happening
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  debug: true
});
```

### Notification Not Showing

**Check these:**
- Is `forceUpdate` set to `false`?
- Is `showNotification` set to `true`?
- Any CSS conflicts?

**Solution:**
```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  forceUpdate: false,        // Must be false
  showNotification: true     // Must be true
});
```

### Page Reloads Constantly

**Check these:**
- Is version format correct? (e.g., "1.0.0")
- Is localStorage working?

**Solution:**
```javascript
// Clear localStorage and restart
localStorage.clear();
location.reload();
```

### Works Locally But Not on Server

**Check these:**
- Use absolute paths: `/version-manifest.json`
- Is HTTPS enabled? (required for Service Workers)
- Check CORS settings if manifest is on different domain

## Advanced Configuration

### Custom Callbacks

Track updates in your analytics:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: (newVersion, oldVersion) => {
    // Google Analytics
    gtag('event', 'update_available', {
      old_version: oldVersion,
      new_version: newVersion
    });
  },
  onUpdateComplete: (version) => {
    gtag('event', 'update_completed', { version });
  },
  onError: (error) => {
    console.error('Update failed:', error);
  }
});
```

### Custom Notification

Replace the default notification:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  showNotification: false,  // Disable default
  onUpdateAvailable: (newVersion) => {
    // Show your own UI
    alert(`New version ${newVersion} available!`);
  }
});
```

### Gradual Rollout

Update only a percentage of users:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: (newVersion) => {
    // Only update 10% of users
    if (Math.random() < 0.1) {
      AutoUpdate.applyUpdate();
    }
  }
});
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

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
      
      - name: Deploy to server
        run: |
          # Your deployment command here
          rsync -avz ./ user@server:/var/www/html/
```

### With npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "node build-version.js patch && npm run upload",
    "upload": "rsync -avz ./ user@server:/var/www/html/"
  }
}
```

Then deploy with:

```bash
npm run deploy
```

## Best Practices

### Version Numbering

Use semantic versioning:
- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Check Intervals

- Development: 10-30 seconds
- Production: 30-60 seconds
- Don't check too frequently (server load)

### User Experience

- Use `forceUpdate: false` for major updates
- Let users finish their work before updating
- Show clear update messages

### Testing

- Always test in staging first
- Test with different browsers
- Test with slow connections
- Test offline behavior

## Support

Need help?

- 📖 [Main Documentation](README.md)
- 🐛 [Report Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites/issues)
- 💬 [Discussions](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites/discussions)
