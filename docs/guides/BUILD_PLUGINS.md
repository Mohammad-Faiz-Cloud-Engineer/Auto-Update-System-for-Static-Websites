# Build Tool Plugins

Stop manually updating version numbers. These plugins do it automatically during your build.

## Why Use Them?

Every time you build, the plugin:
- Reads your package.json version
- Calculates file hashes
- Generates the version manifest
- All automatically

No more forgetting to bump versions or running separate scripts.

## Webpack Plugin

### Setup

1. Copy the plugin to your project:

```bash
cp plugins/webpack/webpack-plugin.js webpack-plugins/
```

2. Add it to `webpack.config.js`:

```javascript
const AutoUpdateWebpackPlugin = require('./webpack-plugins/webpack-plugin');

module.exports = {
  plugins: [
    new AutoUpdateWebpackPlugin({
      version: '1.0.0',
      files: ['**/*.js', '**/*.css'],
      exclude: ['version-manifest.json', '**/*.map']
    })
  ]
};
```

3. Build normally:

```bash
npm run build
```

The manifest gets generated automatically.

### Options

```javascript
{
  version: '1.0.0',              // Required - your app version
  files: ['**/*.js', '**/*.css'], // Which files to track
  exclude: ['**/*.map'],          // Files to ignore
  manifestPath: 'version-manifest.json',
  hashAlgorithm: 'sha256',
  hashLength: 16,
  description: 'Production build',
  changelog: []
}
```

### Use package.json Version

```javascript
const pkg = require('./package.json');

new AutoUpdateWebpackPlugin({
  version: pkg.version  // Reads from package.json
})
```

Then bump versions the normal way:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm run build
```

---

## Vite Plugin

### Setup

1. Copy the plugin:

```bash
cp plugins/vite/vite-plugin.js vite-plugins/
```

2. Add to `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import autoUpdate from './vite-plugins/vite-plugin';

export default defineConfig({
  plugins: [
    autoUpdate({
      version: '1.0.0'
    })
  ]
});
```

3. Build:

```bash
npm run build
```

### With package.json

```javascript
import pkg from './package.json';

export default defineConfig({
  plugins: [
    autoUpdate({
      version: pkg.version
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
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build  # Plugin runs automatically
      - run: npm run deploy
```

The plugin generates the manifest during build. No extra steps needed.

### GitLab CI

```yaml
build:
  script:
    - npm install
    - npm run build  # Manifest generated here
  artifacts:
    paths:
      - dist/
```

---

## Advanced Usage

### Environment-Specific Builds

```javascript
const config = {
  production: {
    version: '1.0.0',
    description: 'Production'
  },
  staging: {
    version: '1.0.0-staging',
    description: 'Staging'
  }
};

new AutoUpdateWebpackPlugin(
  config[process.env.NODE_ENV] || config.production
)
```

### Only in Production

```javascript
plugins: [
  ...(process.env.NODE_ENV === 'production' ? [
    new AutoUpdateWebpackPlugin({ version: pkg.version })
  ] : [])
]
```

### Custom Build Numbers

```javascript
new AutoUpdateWebpackPlugin({
  version: '1.0.0',
  buildNumber: process.env.CI_PIPELINE_ID || Date.now().toString()
})
```

---

## Troubleshooting

**Manifest not created**  
Check that the plugin is in your plugins array and the build completes without errors.

**Wrong files included**  
Adjust the `files` and `exclude` patterns to match your build output.

**Version not updating**  
Make sure you're bumping the version in package.json before building.

---

## Migration from Manual Script

If you're using `build-version.js` manually:

1. Add the plugin to your build config
2. Remove the manual script from your workflow
3. Test that the manifest generates correctly

The plugin does everything the script did, but automatically.

---

## What Gets Generated

```json
{
  "version": "1.0.0",
  "buildNumber": "20260320120000",
  "timestamp": "2026-03-20T12:00:00.000Z",
  "files": {
    "main.js": "a1b2c3d4e5f6g7h8",
    "main.css": "h8g7f6e5d4c3b2a1"
  }
}
```

The library uses this to detect when files change and trigger updates.

---

## Examples

See the plugin files for complete examples:
- `plugins/webpack/webpack-plugin.js`
- `plugins/vite/vite-plugin.js`

Both include detailed comments.
