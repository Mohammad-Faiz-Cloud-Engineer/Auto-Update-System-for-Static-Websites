# Server Cache Configuration

The library clears client-side cache perfectly. But you also need to configure your server properly, or browsers will still serve stale files.

## The Problem

Even after clearing browser cache, the browser might request files from the server and get told "use your cached version" by the server's cache headers. You need to configure both sides.

## Quick Fix

For `version-manifest.json`, set these headers:

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

This tells browsers to always fetch a fresh copy.

## Recommended Strategy

**version-manifest.json** - Never cache (always fresh)  
**HTML files** - Short cache (5 minutes)  
**CSS/JS files** - Long cache (1 year) with versioned URLs

This gives you fast loading AND instant updates.

---

## Configuration by Server

### Apache (.htaccess)

```apache
# Never cache the manifest
<Files "version-manifest.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
</Files>

# Short cache for HTML
<FilesMatch "\.(html|htm)$">
    Header set Cache-Control "public, max-age=300, must-revalidate"
</FilesMatch>

# Long cache for CSS/JS (use versioned URLs like app.v1.0.1.js)
<FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

### Nginx

```nginx
server {
    # Never cache manifest
    location = /version-manifest.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
    }

    # Short cache for HTML
    location ~* \.(html|htm)$ {
        add_header Cache-Control "public, max-age=300, must-revalidate";
    }

    # Long cache for assets
    location ~* \.(css|js)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Node.js (Express)

```javascript
const express = require('express');
const app = express();

// Never cache manifest
app.get('/version-manifest.json', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.sendFile(__dirname + '/version-manifest.json');
});

// Short cache for HTML
app.use('*.html', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300, must-revalidate');
    next();
});

// Long cache for static assets
app.use('/static', express.static('public', {
    maxAge: '1y',
    immutable: true
}));
```

---

## CDN Configuration

### Cloudflare

1. Go to Caching → Configuration
2. Set Browser Cache TTL: Respect Existing Headers
3. Create Page Rule for `*version-manifest.json`:
   - Cache Level: Bypass

### Netlify (_headers file)

```
/version-manifest.json
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0

/*.html
  Cache-Control: public, max-age=300, must-revalidate

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable
```

### Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/version-manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate, max-age=0" }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=300, must-revalidate" }
      ]
    }
  ]
}
```

---

## Testing Your Setup

### Command Line

```bash
curl -I https://your-site.com/version-manifest.json
```

Look for:
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

### Browser DevTools

1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Click `version-manifest.json`
5. Check Response Headers

Should show `Cache-Control: no-cache...`

---

## Common Issues

**Updates not detected**  
Your CDN is probably caching the manifest. Configure it to bypass cache for that file.

**Old CSS/JS still loading**  
Use versioned URLs: `app.js?v=1.0.1` or `app.v1.0.1.js`

**Browser ignores headers**  
Try testing in incognito mode. Some browsers cache aggressively.

---

## Best Practices

1. Never cache version-manifest.json (critical!)
2. Use versioned URLs for CSS/JS files
3. Enable gzip compression
4. Test in multiple browsers
5. Monitor your CDN cache hit rates

---

## Security Headers (Bonus)

While you're configuring headers, add these for security:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## Verification Checklist

- [ ] version-manifest.json returns no-cache headers
- [ ] HTML has short cache (5 min)
- [ ] CSS/JS has long cache (1 year)
- [ ] Assets use versioned URLs
- [ ] CDN bypasses manifest cache
- [ ] Tested in DevTools
- [ ] Tested with curl

---

## Need Help?

- Client-side issues: Check auto-update.js config
- Server-side issues: Check this guide
- CDN issues: Check your CDN provider docs

The library handles client-side perfectly. You just need to configure the server properly.
