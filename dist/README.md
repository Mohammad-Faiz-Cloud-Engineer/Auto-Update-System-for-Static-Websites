# Distribution Files

Production-ready files for deployment.

- `auto-update.js` - Minified library (use this in production)
- `auto-update.d.ts` - TypeScript definitions
- `version-manifest.json` - Version manifest template

## Quick Start

1. Copy these files to your website root
2. Add to your HTML:

```html
<script src="auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json'
  });
</script>
```
