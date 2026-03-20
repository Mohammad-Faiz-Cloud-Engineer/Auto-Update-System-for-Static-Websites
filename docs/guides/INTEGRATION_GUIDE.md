# Integration Guide

How to add auto-updates to your website in 5 minutes.

## Step 1: Download Files

Grab these files from the `dist/` folder:
- `auto-update.js` - The main library
- `auto-update-sw.js` - Service Worker (optional, for offline mode)

Put them in your public folder.

## Step 2: Add the Script

Add this to your HTML:

```html
<script src="/auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000  // Check every 30 seconds
  });
</script>
```

## Step 3: Create Version Manifest

Create `version-manifest.json` in your public folder:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260320120000",
  "timestamp": "2026-03-20T12:00:00.000Z"
}
```

## Step 4: Update on Deploy

When you deploy, bump the version:

```bash
node build-version.js patch  # 1.0.0 → 1.0.1
```

Or manually edit the JSON file.

## Step 5: Test It

1. Open your site
2. Change the version in `version-manifest.json`
3. Wait 30 seconds
4. Page should reload automatically

Done!

## Optional: Add Service Worker (v2.2)

For offline support and faster loads:

```html
<script src="/auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000,
    
    // Enable offline mode
    serviceWorker: true,
    serviceWorkerUrl: '/auto-update-sw.js',
    offlineFirst: true,
    backgroundSync: true,
    deltaUpdates: true
  });
</script>
```

Make sure `auto-update-sw.js` is in your public folder.

## Configuration Options

```javascript
AutoUpdate.init({
  // Required
  manifestUrl: '/version-manifest.json',
  
  // Basic
  checkInterval: 30000,        // How often to check (ms)
  forceUpdate: true,           // Auto-reload or show notification
  showNotification: true,      // Show update notification
  debug: false,                // Console logging
  
  // Advanced
  retryAttempts: 3,            // Retry failed checks
  retryDelay: 5000,            // Delay between retries (ms)
  rolloutPercentage: 1.0,      // Update X% of users (0.0 to 1.0)
  
  // v2.2 - Offline
  serviceWorker: true,         // Enable Service Worker
  serviceWorkerUrl: '/auto-update-sw.js',
  offlineFirst: true,          // Cache-first strategy
  backgroundSync: true,        // Background updates
  deltaUpdates: true,          // Only download changed files
  
  // Callbacks
  onUpdateAvailable: (newVer, oldVer) => {
    console.log(`Update: ${oldVer} → ${newVer}`);
  },
  onUpdateComplete: (version) => {
    console.log(`Updated to ${version}`);
  },
  onError: (error) => {
    console.error('Update failed:', error);
  }
});
```

## Server Configuration

For best results, configure your server to not cache the manifest:

### Nginx

```nginx
location /version-manifest.json {
  add_header Cache-Control "no-store, no-cache, must-revalidate";
  add_header Pragma "no-cache";
  add_header Expires "0";
}
```

### Apache

```apache
<Files "version-manifest.json">
  Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
  Header set Pragma "no-cache"
  Header set Expires "0"
</Files>
```

### Node.js/Express

```javascript
app.get('/version-manifest.json', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.sendFile('version-manifest.json');
});
```

## Troubleshooting

### Updates Not Working

**Check the console** - Enable debug mode:
```javascript
AutoUpdate.init({ debug: true, ... });
```

**Check the manifest** - Make sure it's accessible:
```bash
curl https://yoursite.com/version-manifest.json
```

**Check the version** - Make sure it changed:
```javascript
// Old version
{ "version": "1.0.0" }

// New version
{ "version": "1.0.1" }
```

### Page Not Reloading

Set `forceUpdate: true`:
```javascript
AutoUpdate.init({
  forceUpdate: true,  // Auto-reload
  ...
});
```

### Service Worker Not Working

**Check HTTPS** - Service Workers require HTTPS (except localhost)

**Check the file** - Make sure `auto-update-sw.js` is accessible:
```bash
curl https://yoursite.com/auto-update-sw.js
```

**Check registration** - Open DevTools → Application → Service Workers

### Still Stuck?

Open an issue on GitHub with:
- Your configuration
- Console errors
- Browser and version
