/**
 * Vite Plugin for Auto-Update System
 * Automatically generates version manifest during build
 * 
 * @version 2.1.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Vite plugin for auto-update manifest generation
 */
export default function autoUpdatePlugin(options = {}) {
  const config = {
    manifestPath: 'version-manifest.json',
    version: options.version || process.env.npm_package_version || '1.0.0',
    files: options.files || ['**/*.js', '**/*.css', '**/*.html'],
    exclude: options.exclude || ['version-manifest.json'],
    hashAlgorithm: 'sha256',
    hashLength: 16,
    ...options
  };

  let viteConfig;

  return {
    name: 'vite-plugin-auto-update',
    
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    generateBundle(outputOptions, bundle) {
      try {
        const manifest = generateManifest(bundle, config);
        const manifestJson = JSON.stringify(manifest, null, 2);

        // Add manifest to bundle
        this.emitFile({
          type: 'asset',
          fileName: config.manifestPath,
          source: manifestJson
        });

        console.log('✅ Auto-Update manifest generated:', config.manifestPath);
      } catch (error) {
        console.error('❌ Failed to generate manifest:', error);
        throw error;
      }
    }
  };
}

function generateManifest(bundle, config) {
  const files = {};

  // Calculate hashes for all bundle files
  for (const [filename, file] of Object.entries(bundle)) {
    if (shouldIncludeFile(filename, config)) {
      const source = file.type === 'chunk' ? file.code : file.source;
      const hash = crypto
        .createHash(config.hashAlgorithm)
        .update(source)
        .digest('hex')
        .substring(0, config.hashLength);
      
      files[filename] = hash;
    }
  }

  return {
    version: config.version,
    buildNumber: generateBuildNumber(),
    timestamp: new Date().toISOString(),
    description: config.description || `Build ${config.version}`,
    files: files,
    changelog: config.changelog || []
  };
}

function shouldIncludeFile(filename, config) {
  // Exclude the manifest itself
  if (config.exclude.includes(filename)) {
    return false;
  }

  // Check if file matches include patterns
  if (config.files.length === 0) {
    return true;
  }

  return config.files.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  });
}

function generateBuildNumber() {
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

/**
 * Usage in vite.config.js:
 * 
 * import { defineConfig } from 'vite';
 * import autoUpdate from './plugins/vite-plugin';
 * 
 * export default defineConfig({
 *   plugins: [
 *     autoUpdate({
 *       version: '1.0.0',
 *       files: ['**\/*.js', '**\/*.css'],
 *       exclude: ['version-manifest.json', '**\/*.map'],
 *       description: 'Production build'
 *     })
 *   ]
 * });
 */
