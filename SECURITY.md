# Security

## Reporting Security Issues

Found a security vulnerability? Don't open a public issue. Email the maintainer directly with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You'll get a response within 48 hours.

## What's Built In

**XSS Protection**  
All user input is sanitized before going into the DOM. Version strings from the manifest are validated and cleaned. No `eval()` or `Function()` constructor anywhere in the code.

**Input Validation**  
The manifest is thoroughly validated - structure, version format, file size (must be under 1MB), content type. Requests timeout after 10 seconds so a slow server won't hang the library.

**Network Security**  
Use HTTPS in production (required for Service Workers anyway). Manifest fetches use cache-busting with random tokens and abort controllers for timeouts. No hardcoded HTTP URLs.

**CSP Compatible**  
Works with Content Security Policy. Recommended policy:

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  connect-src 'self';
```

The `'unsafe-inline'` is needed for notification styles. If you need stricter CSP, extract the styles to a separate CSS file.

**File Integrity**  
The build script generates SHA-256 hashes of your files. You can verify them:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: async (newVersion, oldVersion) => {
    const response = await fetch('/version-manifest.json');
    const manifest = await response.json();
    
    if (manifest.files && manifest.files['auto-update.js']) {
      console.log('File hash:', manifest.files['auto-update.js']);
      // Compare with expected hash
    }
  }
});
```

## Best Practices

**Use HTTPS**  
Always. Not optional. Service Workers require it anyway.

```javascript
// Good
manifestUrl: 'https://example.com/version-manifest.json'

// Bad
manifestUrl: 'http://example.com/version-manifest.json'
```

**Validate on the server**  
Don't just serve a static JSON file. Generate it dynamically and sanitize the values:

```javascript
app.get('/version-manifest.json', (req, res) => {
  const manifest = {
    version: sanitize(process.env.APP_VERSION),
    buildNumber: sanitize(process.env.BUILD_NUMBER),
    timestamp: new Date().toISOString()
  };
  res.json(manifest);
});
```

**Use Subresource Integrity for CDN**  
If you're serving the library from a CDN:

```html
<script 
  src="https://cdn.example.com/auto-update.js" 
  integrity="sha384-..." 
  crossorigin="anonymous">
</script>
```

**Rate limit manifest requests**  
Prevent abuse:

```nginx
limit_req_zone $binary_remote_addr zone=manifest:10m rate=10r/m;

location = /version-manifest.json {
    limit_req zone=manifest burst=5;
}
```

**Monitor for anomalies**  
Track errors and unusual patterns:

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onError: (error) => {
    analytics.track('update_error', {
      error: error.message,
      timestamp: Date.now()
    });
  }
});
```

## Known Risks

**Manifest tampering**  
If someone can modify `version-manifest.json` on your server, they can trigger unwanted updates. Secure your server. Use file integrity monitoring. Consider manifest signing (see below).

**Man-in-the-middle attacks**  
Without HTTPS, the manifest can be intercepted and modified. Use HTTPS. Enable HSTS headers. For mobile apps, consider certificate pinning.

**Denial of service**  
Rapid version changes could cause excessive reloads. Implement rate limiting on the server. Monitor update frequency.

## Advanced: Manifest Signing

For high-security applications, you can sign the manifest to prevent tampering.

Generate a key pair:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Server-side (Node.js):

```javascript
const crypto = require('crypto');
const fs = require('fs');

function signManifest(manifest) {
  const privateKey = fs.readFileSync('private.pem', 'utf8');
  const sign = crypto.createSign('SHA256');
  
  const data = JSON.stringify({
    version: manifest.version,
    buildNumber: manifest.buildNumber,
    timestamp: manifest.timestamp
  });
  
  sign.update(data);
  sign.end();
  
  return {
    ...manifest,
    signature: sign.sign(privateKey, 'base64')
  };
}

app.get('/version-manifest.json', (req, res) => {
  const manifest = {
    version: '1.0.0',
    buildNumber: '20260319001',
    timestamp: new Date().toISOString()
  };
  
  res.json(signManifest(manifest));
});
```

Client-side:

```javascript
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;

async function verifyManifest(manifest) {
  if (!manifest.signature) {
    throw new Error('Manifest not signed');
  }
  
  const encoder = new TextEncoder();
  const data = JSON.stringify({
    version: manifest.version,
    buildNumber: manifest.buildNumber,
    timestamp: manifest.timestamp
  });
  
  const signature = Uint8Array.from(atob(manifest.signature), c => c.charCodeAt(0));
  
  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(PUBLIC_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const isValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signature,
    encoder.encode(data)
  );
  
  if (!isValid) {
    throw new Error('Invalid manifest signature');
  }
  
  return true;
}

AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  onUpdateAvailable: async (newVersion, oldVersion) => {
    const response = await fetch('/version-manifest.json');
    const manifest = await response.json();
    
    try {
      await verifyManifest(manifest);
      console.log('Manifest signature valid');
    } catch (error) {
      console.error('Manifest signature invalid:', error);
      return; // abort update
    }
  }
});
```

## Pre-Deployment Checklist

Before going to production:

- HTTPS enabled
- CSP headers configured
- Security headers added (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting implemented
- Manifest validation on server
- Error monitoring configured
- Tested in multiple browsers
- Callbacks reviewed for sensitive data exposure
- File integrity monitoring enabled
- Backup and rollback plan ready

## Privacy

This library doesn't collect or store personal data. Everything is stored locally in the user's browser. No analytics, no tracking, no phone-home.

GDPR compliant by default. CCPA compliant by default.

Not HIPAA compliant out of the box - if you're building healthcare apps, talk to a compliance expert.

## Updates

This security policy is reviewed quarterly. Last updated: March 2026.

## License

MIT License - same as the rest of the project.
