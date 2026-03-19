#!/usr/bin/env node

/**
 * Build Version Script
 * Automatically bumps version numbers in version-manifest.json
 * 
 * Usage:
 *   node build-version.js patch  (1.0.0 → 1.0.1)
 *   node build-version.js minor  (1.0.0 → 1.1.0)
 *   node build-version.js major  (1.0.0 → 2.0.0)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const MANIFEST_PATH = path.join(__dirname, 'version-manifest.json');
const FILES_TO_HASH = [
  'auto-update.js',
  'examples/basic-integration.html',
  'examples/advanced-integration.html'
];

/**
 * Read manifest file
 */
function readManifest() {
  try {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to read manifest:', error.message);
    process.exit(1);
  }
}

/**
 * Write manifest file
 */
function writeManifest(manifest) {
  try {
    const content = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(MANIFEST_PATH, content, 'utf8');
    console.log('✅ Manifest updated successfully');
  } catch (error) {
    console.error('❌ Failed to write manifest:', error.message);
    process.exit(1);
  }
}

/**
 * Parse semantic version
 */
function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0
  };
}

/**
 * Bump version
 */
function bumpVersion(version, type) {
  const v = parseVersion(version);
  
  switch (type) {
    case 'major':
      v.major++;
      v.minor = 0;
      v.patch = 0;
      break;
    case 'minor':
      v.minor++;
      v.patch = 0;
      break;
    case 'patch':
      v.patch++;
      break;
    default:
      console.error('❌ Invalid bump type. Use: major, minor, or patch');
      process.exit(1);
  }
  
  return `${v.major}.${v.minor}.${v.patch}`;
}

/**
 * Generate build number (YYYYMMDDHHMMSS format)
 */
function generateBuildNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Calculate file hash
 */
function calculateFileHash(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath);
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  } catch (error) {
    console.warn(`⚠️  Could not hash ${filePath}:`, error.message);
    return 'unknown';
  }
}

/**
 * Update file hashes
 */
function updateFileHashes(manifest) {
  const files = {};
  
  for (const file of FILES_TO_HASH) {
    files[file] = calculateFileHash(file);
  }
  
  manifest.files = files;
  return manifest;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0] || 'patch';
  
  console.log('🚀 Auto-Update Version Builder\n');
  
  // Read current manifest
  const manifest = readManifest();
  const oldVersion = manifest.version;
  
  console.log(`📦 Current version: ${oldVersion}`);
  
  // Bump version
  const newVersion = bumpVersion(oldVersion, bumpType);
  console.log(`📦 New version: ${newVersion} (${bumpType} bump)`);
  
  // Generate build number
  const buildNumber = generateBuildNumber();
  console.log(`🔢 Build number: ${buildNumber}`);
  
  // Update manifest
  manifest.version = newVersion;
  manifest.buildNumber = buildNumber;
  manifest.timestamp = new Date().toISOString();
  
  // Update file hashes
  console.log('\n📝 Calculating file hashes...');
  updateFileHashes(manifest);
  
  // Add changelog entry
  if (!manifest.changelog) {
    manifest.changelog = [];
  }
  manifest.changelog.unshift(`Version ${newVersion} - ${new Date().toLocaleDateString()}`);
  
  // Keep only last 10 changelog entries
  if (manifest.changelog.length > 10) {
    manifest.changelog = manifest.changelog.slice(0, 10);
  }
  
  // Write manifest
  console.log('\n💾 Writing manifest...');
  writeManifest(manifest);
  
  console.log('\n✨ Version bump complete!\n');
  console.log('Next steps:');
  console.log('1. Review the changes in version-manifest.json');
  console.log('2. Commit the changes to git');
  console.log('3. Deploy to your server');
  console.log('4. Users will automatically receive the update\n');
}

// Run
main();
