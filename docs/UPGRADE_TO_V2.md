# Upgrade to Version 2.0 - Quick Guide

## What's New in v2.0?

Version 2.0 is a **production-grade release** with enhanced security, bug fixes, and comprehensive documentation. It's **100% backward compatible** with v1.x - no code changes required!

---

## Quick Upgrade (5 Minutes)

### Step 1: Replace Files

Download and replace these files:

1. `auto-update.js` (v2.0.0)
2. `build-version.js` (v2.0.0)
3. `version-manifest.json` (update version to 2.0.0)

### Step 2: Configure Server (Critical!)

This is the **most important step** for v2.0.

Add these headers to your server for `version-manifest.json`:

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

**Why?** Without this, browsers/CDNs may cache the manifest and users won't get updates.

📖 **See [SERVER_CACHE_CONFIG.md](SERVER_CACHE_CONFIG.md) for complete instructions.**

### Step 3: Test

1. Deploy to staging
2. Open browser DevTools → Network tab
3. Check `version-manifest.json` headers
4. Verify updates are detected

### Step 4: Deploy

Deploy to production. Done!

---

## What You Get

### 🔒 Security Enhancements
- XSS protection with input sanitization
- Enhanced input validation
- Timeout protection (10s)
- No memory leaks
- No race conditions

### 🐛 Bug Fixes
- Fixed race conditions in update checks
- Fixed memory leaks from event listeners
- Fixed incomplete cache clearing
- Fixed version comparison for pre-releases

### 📚 New Documentation
- `SERVER_CACHE_CONFIG.md` - Complete server configuration guide
- `SECURITY.md` - Comprehensive security documentation
- `FIXES_SUMMARY.md` - Detailed list of all fixes
- `UPGRADE_TO_V2.md` - This guide

### ✨ Improvements
- Better error messages
- Enhanced build script with atomic writes
- SHA-256 hashing (upgraded from MD5)
- Comprehensive validation everywhere

---

## Configuration (Optional)

Your existing configuration still works! But you can now be more explicit:

```javascript
// Before (still works)
AutoUpdate.init({
  manifestUrl: '/version-manifest.json'
});

// After (recommended - same defaults, just explicit)
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,      // 30 seconds
  forceUpdate: true,          // Auto-reload on update
  showNotification: true,     // Show notification
  debug: false,               // No console logs
  retryAttempts: 3,           // Retry 3 times on failure
  retryDelay: 5000,           // 5 seconds between retries
  
  // Callbacks (optional)
  onUpdateAvailable: (newVersion, oldVersion) => {
    console.log(`Update: ${oldVersion} → ${newVersion}`);
  },
  onUpdateComplete: (version) => {
    console.log(`Now running ${version}`);
  },
  onError: (error) => {
    console.error('Update failed:', error);
  }
});
```

---

## Server Configuration Examples

### Apache (.htaccess)

```apache
<Files "version-manifest.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>
```

### Nginx

```nginx
location = /version-manifest.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### Node.js (Express)

```javascript
app.get('/version-manifest.json', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.sendFile(__dirname + '/version-manifest.json');
});
```

### Netlify (_headers file)

```
/version-manifest.json
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0
```

### Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/version-manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate, max-age=0"
        }
      ]
    }
  ]
}
```

📖 **More examples in [SERVER_CACHE_CONFIG.md](SERVER_CACHE_CONFIG.md)**

---

## Testing Your Upgrade

### Test 1: Verify Headers

```bash
curl -I https://your-site.com/version-manifest.json
```

Should show:
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

### Test 2: Browser DevTools

1. Open your site
2. Press F12 → Network tab
3. Reload page
4. Click `version-manifest.json`
5. Check Response Headers

### Test 3: Update Detection

1. Keep browser open
2. Edit `version-manifest.json` on server
3. Change version from `2.0.0` to `2.0.1`
4. Wait 30 seconds
5. Should see update notification or page reload

---

## Troubleshooting

### Updates Not Detected

**Check:**
- Server headers configured correctly?
- Version number actually changed?
- Browser console for errors?

**Solution:**
```javascript
// Enable debug mode
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  debug: true  // See what's happening
});
```

### Old Content Still Loading

**Check:**
- Are assets versioned? (e.g., `app.js?v=2.0.0`)
- CDN configured correctly?
- HTML cache headers set?

**Solution:**
- Use versioned URLs for CSS/JS
- Configure CDN to respect cache headers
- See [SERVER_CACHE_CONFIG.md](SERVER_CACHE_CONFIG.md)

### Page Reloads Constantly

**Check:**
- Version format correct? (e.g., `"2.0.0"` not `"2.0"`)
- localStorage working?

**Solution:**
```javascript
// Clear localStorage and restart
localStorage.clear();
location.reload();
```

---

## Security Improvements

v2.0 includes multiple security enhancements:

1. **XSS Protection** - All user input sanitized
2. **Input Validation** - Manifest thoroughly validated
3. **Timeout Protection** - 10s timeout on requests
4. **No Memory Leaks** - Proper resource cleanup
5. **No Race Conditions** - Concurrent operation safe

📖 **See [SECURITY.md](SECURITY.md) for complete security documentation.**

---

## Performance Improvements

- **Reduced Network Calls** - Promise caching prevents redundant fetches
- **Efficient Cache Clearing** - Parallel cache operations
- **Memory Optimization** - Event listener cleanup
- **Better Error Handling** - Faster failure recovery

---

## Breaking Changes

**None!** Version 2.0 is 100% backward compatible with v1.x.

All existing configurations work without changes.

---

## Rollback Plan

If you need to rollback:

1. Replace `auto-update.js` with v1.0.1
2. Replace `build-version.js` with v1.0.1
3. Update `version-manifest.json` version to `1.0.1`
4. Deploy

Your configuration will still work.

---

## Next Steps

After upgrading:

1. ✅ Configure server headers (critical!)
2. ✅ Test in staging
3. ✅ Deploy to production
4. ✅ Monitor for issues
5. 📖 Read [SECURITY.md](SECURITY.md) for best practices
6. 📖 Read [SERVER_CACHE_CONFIG.md](SERVER_CACHE_CONFIG.md) for optimization

---

## Support

Need help?

- 📖 [Complete Documentation](README.md)
- 🚀 [Integration Guide](INTEGRATION_GUIDE.md)
- 🔒 [Security Guide](SECURITY.md)
- 🖥️ [Server Configuration](SERVER_CACHE_CONFIG.md)
- 📋 [All Fixes](FIXES_SUMMARY.md)
- 🐛 [Report Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites/issues)

---

## Checklist

Before deploying v2.0:

- [ ] Downloaded new files
- [ ] Configured server headers for manifest
- [ ] Tested in staging
- [ ] Verified headers with curl or DevTools
- [ ] Tested update detection
- [ ] Read security documentation
- [ ] Configured CDN (if applicable)
- [ ] Updated monitoring/analytics
- [ ] Informed team of upgrade
- [ ] Deployed to production

---

## Summary

**Version 2.0 is a drop-in replacement with:**
- ✅ Zero breaking changes
- ✅ Enhanced security
- ✅ Bug fixes
- ✅ Better performance
- ✅ Complete documentation

**Most important:** Configure server headers for `version-manifest.json`!

**Upgrade time:** 5-10 minutes

**Ready to deploy:** Yes!

---

**Questions?** Check the documentation or open an issue on GitHub.

**Happy updating! 🚀**
