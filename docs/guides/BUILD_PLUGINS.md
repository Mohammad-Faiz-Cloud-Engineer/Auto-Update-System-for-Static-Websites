# Build Tool Plugins

Automatic version manifest generation for Webpack and Vite.

## Why Use Plugins?

Instead of manually bumping versions and running build scripts, these plugins automatically generate the version manifest during your build process. They calculate file hashes, generate build numbers, and create the manifest - all automatically.

## Webpack Plugin

### Installation

Copy the plugin to your project:

```bash
cp plugins/webpack-plugin.js webpack-plugins/
```

### Configuration

In `webpack.config.js`:

```javascript
const AutoUpdateWebpackPlugin = require('./webpack-plugins/webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new AutoUpdateWebpackPlugin({
      version: '1.0.0',  // or process.env.npm_package_version
      files: ['**/*.js', '**/*.css'],
      exclude: ['version-manifest.json', '**/*.map'],
      description: 'Production build'
    })
  ]
};
```

### Options

```javascript
{
  // Version string (required)
  version: '1.0.0',
  
  // Files to include in manifest (glob patterns)
  files: ['**/*.js', '**/*.css', '**/*.html'],
  
  // Files to exclude
  exclude: ['version-manifest.json', '**/*.map'],
  
  // Output path for manifest
  manifestPath: 'version-manifest.json',
  
  // Hash algorithm
  hashAlgorithm: 'sha256',
  
  // Hash length
  hashLength: 16,
  
  // Optional description
  description: 'Production build',
  
  // Optional changelog
  changelog: ['Fixed bug X', 'Added feature Y']
}
```

### Example Output

The plugin generates:

```json
{
  "version": "1.0.0",
  "buildNumber": "20260320120000",
  "timestamp": "2026-03-20T12:00:00.000Z",
  "description": "Production build",
  "files": {
    "main.js": "a1b2c3d4e5f6g7h8",
    "main.css": "h8g7f6e5d4c3b2a1",
    "index.html": "1a2b3c4d5e6f7g8h"
  },
  "changelog": []
}
```

### With Environment Variables

```javascript
new AutoUpdateWebpackPlugin({
  version: process.env.npm_package_version,
  description: `Build ${process.env.CI_COMMIT_SHA || 'local'}`
})
```

### With package.json Version

```javascript
const package = require('./package.json');

new AutoUpdateWebpackPlugin({
  version: package.version,
  changelog: package.changelog || []
})
```

---

## Vite Plugin (autoUpdatePlugin)

### Installation

Copy the plugin to your project:

```bash
cp plugins/vite-plugin.js vite-plugins/
```

### Configuration

In `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import autoUpdate from './vite-plugins/vite-plugin';

export default defineConfig({
  plugins: [
    autoUpdate({
      version: '1.0.0',
      files: ['**/*.js', '**/*.css'],
      exclude: ['version-manifest.json', '**/*.map'],
      description: 'Production build'
    })
  ]
});
```

### Options

Same as Webpack plugin:

```javascript
{
  version: '1.0.0',
  files: ['**/*.js', '**/*.css', '**/*.html'],
  exclude: ['version-manifest.json', '**/*.map'],
  manifestPath: 'version-manifest.json',
  hashAlgorithm: 'sha256',
  hashLength: 16,
  description: 'Production build',
  changelog: []
}
```

### With package.json

```javascript
import { defineConfig } from 'vite';
import autoUpdate from './vite-plugins/vite-plugin';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    autoUpdate({
      version: pkg.version,
      description: `Build ${pkg.version}`
    })
  ]
});
```

### With Environment Variables

```javascript
export default defineConfig({
  plugins: [
    autoUpdate({
      version: process.env.npm_package_version || '1.0.0',
      description: process.env.VITE_BUILD_DESC || 'Production build'
    })
  ]
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          npm_package_version: ${{ github.ref_name }}
      
      - name: Deploy
        run: |
          # Your deployment command
          rsync -avz dist/ user@server:/var/www/html/
```

The plugin automatically generates the manifest during `npm run build`.

### GitLab CI

```yaml
build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main
```

### Manual Version Bumping

If you want to bump versions manually:

```bash
# Bump version in package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Build (plugin uses package.json version)
npm run build

# Deploy
npm run deploy
```

---

## Advanced Usage

### Custom Build Numbers

```javascript
new AutoUpdateWebpackPlugin({
  version: '1.0.0',
  buildNumber: process.env.CI_PIPELINE_ID || Date.now().toString()
})
```

### Multiple Environments

```javascript
const config = {
  production: {
    version: '1.0.0',
    description: 'Production build'
  },
  staging: {
    version: '1.0.0-staging',
    description: 'Staging build'
  }
};

new AutoUpdateWebpackPlugin(
  config[process.env.NODE_ENV] || config.production
)
```

### Conditional Plugin

Only generate manifest in production:

```javascript
plugins: [
  // ... other plugins
  ...(process.env.NODE_ENV === 'production' ? [
    new AutoUpdateWebpackPlugin({
      version: package.version
    })
  ] : [])
]
```

---

## Comparison with Manual Script

### Manual (old way)

```bash
# Edit files
# Run: node build-version.js patch
# Build: npm run build
# Deploy
```

### With Plugin (new way)

```bash
# Edit files
# Build: npm run build  (manifest generated automatically)
# Deploy
```

The plugin is integrated into your build process, so you don't need a separate step.

---

## Troubleshooting

**Manifest not generated**  
Check that the plugin is in the `plugins` array and your build completes successfully.

**Wrong files in manifest**  
Adjust the `files` and `exclude` options to match your build output.

**Version not updating**  
Make sure you're bumping the version in `package.json` or passing a new version to the plugin.

**Build fails**  
Check the console for errors. The plugin will log what went wrong.

---

## Migration from Manual Script

If you're currently using `build-version.js`:

1. Install the plugin for your build tool
2. Configure it in your build config
3. Remove `build-version.js` from your build scripts
4. Test that manifest is generated correctly

The plugin does everything the manual script did, but automatically during build.

---

## Examples

Complete examples in `plugins/`:
- `webpack-plugin.js` - Webpack integration
- `vite-plugin.js` - Vite integration

Both include detailed comments and usage examples.
