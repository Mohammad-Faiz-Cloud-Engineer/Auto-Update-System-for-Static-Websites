/**
 * Webpack Plugin for Auto-Update System
 * Automatically generates version manifest during build
 * 
 * @version 2.1.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AutoUpdateWebpackPlugin {
  constructor(options = {}) {
    this.options = {
      manifestPath: 'version-manifest.json',
      version: options.version || process.env.npm_package_version || '1.0.0',
      files: options.files || ['**/*.js', '**/*.css', '**/*.html'],
      exclude: options.exclude || ['version-manifest.json'],
      hashAlgorithm: 'sha256', // SHA-256 for security
      hashLength: 16,
      ...options
    };
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('AutoUpdateWebpackPlugin', (compilation, callback) => {
      try {
        const manifest = this.generateManifest(compilation);
        const manifestJson = JSON.stringify(manifest, null, 2);

        // Add manifest to compilation assets
        compilation.assets[this.options.manifestPath] = {
          source: () => manifestJson,
          size: () => manifestJson.length
        };

        console.log('✅ Auto-Update manifest generated:', this.options.manifestPath);
        callback();
      } catch (error) {
        console.error('❌ Failed to generate manifest:', error);
        callback(error);
      }
    });
  }

  generateManifest(compilation) {
    const files = {};
    const assets = compilation.assets;

    // Calculate hashes for all assets
    for (const filename in assets) {
      if (this.shouldIncludeFile(filename)) {
        const source = assets[filename].source();
        const hash = crypto.createHash(this.options.hashAlgorithm)
          .update(source)
          .digest('hex')
          .substring(0, this.options.hashLength);
        
        files[filename] = hash;
      }
    }

    return {
      version: this.options.version,
      buildNumber: this.generateBuildNumber(),
      timestamp: new Date().toISOString(),
      description: this.options.description || `Build ${this.options.version}`,
      files: files,
      changelog: this.options.changelog || []
    };
  }

  shouldIncludeFile(filename) {
    // Exclude the manifest itself
    if (this.options.exclude.includes(filename)) {
      return false;
    }

    // Check if file matches include patterns
    if (this.options.files.length === 0) {
      return true;
    }

    return this.options.files.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    });
  }

  generateBuildNumber() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');
  }
}

module.exports = AutoUpdateWebpackPlugin;

/**
 * Usage in webpack.config.js:
 * 
 * const AutoUpdateWebpackPlugin = require('./plugins/webpack-plugin');
 * 
 * module.exports = {
 *   // ... other config
 *   plugins: [
 *     new AutoUpdateWebpackPlugin({
 *       version: '1.0.0',
 *       files: ['**\/*.js', '**\/*.css'],
 *       exclude: ['version-manifest.json', '**\/*.map'],
 *       description: 'Production build'
 *     })
 *   ]
 * };
 */
