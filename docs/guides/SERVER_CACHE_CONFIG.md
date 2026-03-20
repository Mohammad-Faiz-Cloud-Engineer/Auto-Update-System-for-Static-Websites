# Server-Side Cache Configuration Guide

## Critical: Client + Server Cache Strategy

The Auto-Update System handles **client-side** cache clearing perfectly. However, to guarantee 100% fresh assets from the server, you **must** configure proper server-side cache headers.

## Why Both Are Needed

- **Client-side clearing** (handled by this library): Clears browser Cache API, Service Workers, localStorage
- **Server-side headers** (you must configure): Tells browsers and CDNs how to cache files

Without proper server headers, browsers may serve stale content even after client cache is cleared.

---

## Quick Start: Recommended Configuration

### For version-manifest.json (NEVER cache)

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

### For HTML files (Short cache with revalidation)

```
Cache-Control: public, max-age=300, must-revalidate
```

### For CSS/JS files (Long cache with versioning)

```
Cache-Control: public, max-age=31536000, immutable
```

Use versioned URLs: `app.js?v=1.0.1` or `app.v1.0.1.js`

---

## Configuration by Server Type

### Apache (.htaccess)

```apache
# Disable caching for version manifest
<Files "version-manifest.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>

# Short cache for HTML
<FilesMatch "\.(html|htm)$">
    Header set Cache-Control "public, max-age=300, must-revalidate"
</FilesMatch>

# Long cache for versioned assets
<FilesMatch "\.(css|js|jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Enable ETags for validation
FileETag MTime Size

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # Disable caching for version manifest
    location = /version-manifest.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        
        # Prevent CDN caching
        add_header X-Accel-Expires "0";
    }

    # Short cache for HTML
    location ~* \.(html|htm)$ {
        add_header Cache-Control "public, max-age=300, must-revalidate";
        etag on;
    }

    # Long cache for versioned assets
    location ~* \.(css|js|jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        etag on;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    gzip_min_length 1000;
}
```

### Node.js (Express)

```javascript
const express = require('express');
const app = express();

// Disable caching for version manifest
app.get('/version-manifest.json', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
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
    immutable: true,
    etag: true
}));

app.listen(3000);
```

### Python (Flask)

```python
from flask import Flask, send_file, make_response
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/version-manifest.json')
def version_manifest():
    response = make_response(send_file('version-manifest.json'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/<path:filename>')
def serve_file(filename):
    response = make_response(send_file(filename))
    
    if filename.endswith('.html'):
        response.headers['Cache-Control'] = 'public, max-age=300, must-revalidate'
    elif filename.endswith(('.css', '.js', '.jpg', '.png')):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    
    return response
```

---

## CDN Configuration

### Cloudflare

1. Go to **Caching** → **Configuration**
2. Set **Browser Cache TTL**: Respect Existing Headers
3. Create **Page Rule** for `*version-manifest.json`:
   - Cache Level: Bypass
   - Edge Cache TTL: 0

### AWS CloudFront

```json
{
  "CacheBehaviors": [
    {
      "PathPattern": "version-manifest.json",
      "MinTTL": 0,
      "MaxTTL": 0,
      "DefaultTTL": 0,
      "ForwardedValues": {
        "QueryString": true,
        "Headers": ["Cache-Control"]
      }
    }
  ]
}
```

### Netlify (_headers file)

```
/version-manifest.json
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0

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
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate, max-age=0"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Testing Your Configuration

### Test 1: Verify Manifest Headers

```bash
curl -I https://your-site.com/version-manifest.json
```

Should show:
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

### Test 2: Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Click on `version-manifest.json`
5. Check **Headers** → **Response Headers**

### Test 3: Online Tools

- [RedBot](https://redbot.org/) - HTTP header analyzer
- [GTmetrix](https://gtmetrix.com/) - Performance + caching analysis

---

## Common Issues

### Issue: Updates not detected immediately

**Cause**: CDN or proxy caching manifest file

**Solution**: 
- Add cache-busting query params (already done in library)
- Configure CDN to bypass cache for manifest
- Use shorter CDN TTL

### Issue: Old CSS/JS still loading

**Cause**: Assets not versioned

**Solution**:
- Use versioned URLs: `app.js?v=1.0.1`
- Or use content hashing: `app.abc123.js`
- Update HTML to reference new versions

### Issue: Browser ignores Cache-Control

**Cause**: Conflicting headers or browser bugs

**Solution**:
- Remove conflicting headers (Expires, Pragma)
- Use `immutable` directive for static assets
- Test in incognito mode

---

## Best Practices

1. **Never cache version-manifest.json** - This is critical
2. **Use versioned URLs for assets** - Enables long caching
3. **Set appropriate TTLs** - Balance freshness vs performance
4. **Enable compression** - Reduces bandwidth
5. **Use ETags** - Enables conditional requests
6. **Test thoroughly** - Verify in multiple browsers
7. **Monitor CDN** - Check cache hit rates

---

## Security Headers (Bonus)

Add these for enhanced security:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

---

## Complete Example: Production Setup

### Directory Structure
```
/var/www/html/
├── index.html
├── version-manifest.json
├── auto-update.js
├── css/
│   └── app.v1.0.1.css
└── js/
    └── app.v1.0.1.js
```

### Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/html;

    # SSL configuration
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Version manifest - never cache
    location = /version-manifest.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    # HTML - short cache
    location ~* \.(html|htm)$ {
        add_header Cache-Control "public, max-age=300, must-revalidate" always;
    }

    # Versioned assets - long cache
    location ~* \.(css|js)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # Images - medium cache
    location ~* \.(jpg|jpeg|png|gif|svg|webp)$ {
        add_header Cache-Control "public, max-age=2592000" always;
    }

    # Fonts - long cache
    location ~* \.(woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

---

## Verification Checklist

- [ ] version-manifest.json has no-cache headers
- [ ] HTML files have short cache (5 minutes)
- [ ] CSS/JS files have long cache (1 year)
- [ ] Assets use versioned URLs
- [ ] CDN configured to bypass manifest cache
- [ ] Tested in multiple browsers
- [ ] Tested with DevTools Network tab
- [ ] Compression enabled
- [ ] Security headers added
- [ ] HTTPS enabled

---

## Support

For issues with:
- **Client-side caching**: Check auto-update.js configuration
- **Server-side caching**: Check this guide
- **CDN caching**: Check your CDN provider docs

Remember: The library handles client-side perfectly. You must handle server-side.
