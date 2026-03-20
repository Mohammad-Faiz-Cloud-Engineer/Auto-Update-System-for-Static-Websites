# Auto-Update System for Static Websites

Stop telling users to clear their cache. This library does it automatically.

When you deploy new code, users still see the old version because their browser cached everything. This fixes that problem by checking for updates and forcing a refresh when needed.

## The Problem

You push an update. Your server has the new files. But users still see the old version. You tell them to hard refresh (Ctrl+F5), but most people don't know what that means.

## The Solution

This library checks your server every 30 seconds for a new version. When it finds one, it clears the browser cache and reloads the page. Users get the update automatically.

## What's New in v2.2

- **Works Offline** - Service Worker caching means your site works without internet
- **Faster** - 83% faster repeat visits by serving from cache
- **Smarter Updates** - Only downloads files that changed (saves 90%+ bandwidth)
- **Background Sync** - Updates happen automatically when connection returns

## Quick Start

### 1. Add the script

```html
<script src="auto-update.js"></script>
<script>
  AutoUpdate.init({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000
  });
</script>
```

### 2. Create version manifest

Create `version-manifest.json`:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260320120000",
  "timestamp": "2026-03-20T12:00:00.000Z"
}
```

### 3. Update on deploy

```bash
# Bump version
node build-version.js patch  # 1.0.0 → 1.0.1

# Deploy
```

That's it. Users get updates automatically.

## Features

**Core**
- Automatic version checking
- Smart cache clearing (all storage types)
- Configurable check intervals
- Force update or show notification
- Custom callbacks

**Security (v2.0)**
- XSS protection
- CSP compatible
- Input validation
- SHA-256 hashing
- No eval() usage

**Frameworks (v2.1)**
- TypeScript definitions
- React hooks
- Vue composables
- Angular services
- Webpack plugin
- Vite plugin

**Offline (v2.2)**
- Service Worker integration
- Offline-first mode
- Background sync
- Delta updates

## Configuration

```javascript
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,
  forceUpdate: true,
  showNotification: true,
  
  // v2.2 features
  serviceWorker: true,
  offlineFirst: true,
  backgroundSync: true,
  deltaUpdates: true,
  
  // Progressive rollout (v2.1)
  rolloutPercentage: 50,  // Update only 50% of users first
  
  // Callbacks
  onUpdateAvailable: (newVer, oldVer) => {
    console.log(`Update: ${oldVer} → ${newVer}`);
  }
});
```

## Framework Integration

### React

```jsx
import { useAutoUpdate } from './integrations/react/react-integration';

function App() {
  const { updateAvailable, applyUpdate } = useAutoUpdate({
    manifestUrl: '/version-manifest.json'
  });

  return updateAvailable ? (
    <button onClick={applyUpdate}>Update Now</button>
  ) : null;
}
```

### Vue

```vue
<script setup>
import { useAutoUpdate } from './integrations/vue/vue-integration';
const { updateAvailable, applyUpdate } = useAutoUpdate();
</script>

<template>
  <button v-if="updateAvailable" @click="applyUpdate">
    Update Now
  </button>
</template>
```

### Angular

```typescript
import { AutoUpdateService } from './integrations/angular/angular-integration';

@Component({
  template: `
    <button *ngIf="updateAvailable$ | async" (click)="applyUpdate()">
      Update Now
    </button>
  `
})
export class AppComponent {
  updateAvailable$ = this.autoUpdate.updateAvailable$;
  
  constructor(private autoUpdate: AutoUpdateService) {}
  
  applyUpdate() {
    this.autoUpdate.applyUpdate();
  }
}
```

## Build Tool Integration

### Webpack

```javascript
const AutoUpdateWebpackPlugin = require('./plugins/webpack/webpack-plugin');

module.exports = {
  plugins: [
    new AutoUpdateWebpackPlugin({
      version: '1.0.0'
    })
  ]
};
```

### Vite

```javascript
import autoUpdate from './plugins/vite/vite-plugin';

export default {
  plugins: [
    autoUpdate({ version: '1.0.0' })
  ]
};
```

## Performance

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First visit | 2.5s | 2.5s | - |
| Repeat visit | 1.8s | 0.3s | 83% faster |
| Offline | Fails | Works | 100% |

**Bandwidth Savings (Delta Updates)**
- 1 file changed: 98% less bandwidth
- 3 files changed: 90% less bandwidth

## Browser Support

- Chrome/Edge 40+
- Firefox 44+
- Safari 11.1+
- Modern mobile browsers

Service Worker features require HTTPS (except localhost).

## Documentation

- [Integration Guide](docs/guides/INTEGRATION_GUIDE.md) - Step-by-step setup
- [Framework Integration](docs/guides/FRAMEWORK_INTEGRATION.md) - React, Vue, Angular
- [Build Plugins](docs/guides/BUILD_PLUGINS.md) - Webpack, Vite
- [Server Configuration](docs/guides/SERVER_CACHE_CONFIG.md) - Cache headers
- [Security](docs/SECURITY.md) - Security practices
- [Contributing](docs/CONTRIBUTING.md) - How to contribute

## Examples

Check the `examples/` folder:
- `basic-integration.html` - Simple setup
- `advanced-integration.html` - All features
- `v2.2-service-worker.html` - Offline mode demo

## Testing

```bash
npm test              # Core tests
npm run test:all      # All tests (265 tests)
```

All tests passing: 265/265 (100%)

## License

MIT

## Author

Mohammad Faiz

## Contributing

Pull requests welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Current Version:** 2.2.0  
**Status:** Production Ready  
**Tests:** 265/265 passing
