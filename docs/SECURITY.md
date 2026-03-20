# Security

## Reporting Security Issues

Found a security problem? Email me directly instead of opening a public issue.

**Email:** [Your email here]

I'll respond within 48 hours and work with you to fix it.

## What We Do

### XSS Protection
All user-facing text is sanitized using `textContent` instead of `innerHTML`. Version strings from the server are cleaned before display.

### No Dangerous Code
- No `eval()`
- No `Function()` constructor
- No inline scripts

### Input Validation
- Manifest files limited to 1MB
- 10 second timeout on network requests
- Content-type verification
- Version string validation

### Secure Hashing
Files are hashed with SHA-256, not MD5.

### HTTPS Required
Service Workers only work over HTTPS (except localhost). This is a browser requirement, not ours.

## What You Should Do

### Server Configuration

Set proper cache headers for the manifest:

```nginx
# Nginx
location /version-manifest.json {
  add_header Cache-Control "no-store, no-cache, must-revalidate";
  add_header Pragma "no-cache";
}
```

### Content Security Policy

If you use CSP, allow the script:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self'">
```

The library is CSP-compatible (no inline scripts).

### Don't Cache Sensitive Data

The Service Worker caches files for offline use. Don't cache:
- User data
- Authentication tokens
- Personal information

### Clear Cache on Logout

```javascript
// On logout
AutoUpdate.destroy();
localStorage.clear();
sessionStorage.clear();
```

## Known Limitations

### Client-Side Only
This library runs in the browser. It can't prevent:
- Man-in-the-middle attacks (use HTTPS)
- Server compromises (secure your server)
- Malicious CDNs (host files yourself)

### Progressive Rollout
The rollout percentage is client-side. A determined user could bypass it. Don't use it for security - it's for gradual deployments.

### Service Worker Scope
Service Workers can intercept all requests in their scope. Make sure your Service Worker file isn't compromised.

## Security Features by Version

### v2.0.0
- XSS protection
- Input validation
- SHA-256 hashing
- CSP compatibility
- Race condition fixes
- Memory leak fixes

### v2.2.0
- Service Worker security
- Cache size limits
- Cache age limits
- Offline security considerations

## Best Practices

1. **Use HTTPS** - Required for Service Workers
2. **Validate Server-Side** - Don't trust client data
3. **Set Cache Headers** - Control what gets cached
4. **Monitor Updates** - Track update success rates
5. **Test Offline** - Make sure offline mode is secure

## Questions?

Open an issue or email me directly for security concerns.
