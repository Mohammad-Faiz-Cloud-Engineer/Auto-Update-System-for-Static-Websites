#!/usr/bin/env node

/**
 * Build Version Script
 * Automatically bumps version numbers in version-manifest.json
 * 
 * Usage:
 *   node build-version.js patch  (1.0.0 → 1.0.1)
 *   node build-version.js minor  (1.0.0 → 1.1.0)
 *   node build-version.js major  (1.0.0 → 2.0.0)
 * 
 * @version 2.0.0
 * @security Enhanced with validation and atomic writes
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
 * Read manifest file with validation
 */
function readManifest() {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.error('❌ Manifest file not found:', MANIFEST_PATH);
      process.exit(1);
    }
    
    const stats = fs.statSync(MANIFEST_PATH);
    if (stats.size === 0) {
      console.error('❌ Manifest file is empty');
      process.exit(1);
    }
    
    if (stats.size > 1024 * 1024) { // 1MB limit
      console.error('❌ Manifest file too large (>1MB)');
      process.exit(1);
    }
    
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    
    // Validate JSON
    const manifest = JSON.parse(content);
    
    // Validate required fields
    if (!manifest.version || typeof manifest.version !== 'string') {
      console.error('❌ Manifest missing valid version field');
      process.exit(1);
    }
    
    return manifest;
  } catch (error) {
    console.error('❌ Failed to read manifest:', error.message);
    process.exit(1);
  }
}

/**
 * Write manifest file atomically with backup
 */
function writeManifest(manifest) {
  try {
    // Validate manifest before writing
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Invalid manifest object');
    }
    
    if (!manifest.version || typeof manifest.version !== 'string') {
      throw new Error('Manifest missing valid version');
    }
    
    const content = JSON.stringify(manifest, null, 2);
    
    // Validate JSON can be parsed back
    JSON.parse(content);
    
    // Create backup
    const backupPath = MANIFEST_PATH + '.backup';
    if (fs.existsSync(MANIFEST_PATH)) {
      fs.copyFileSync(MANIFEST_PATH, backupPath);
      console.log('📦 Backup created:', backupPath);
    }
    
    // Atomic write using temp file
    const tempPath = MANIFEST_PATH + '.tmp';
    fs.writeFileSync(tempPath, content, 'utf8');
    
    // Verify temp file
    const verifyContent = fs.readFileSync(tempPath, 'utf8');
    JSON.parse(verifyContent); // Ensure it's valid JSON
    
    // Rename (atomic on most systems)
    fs.renameSync(tempPath, MANIFEST_PATH);
    
    console.log('✅ Manifest updated successfully');
    
    // Clean up old backup after successful write
    setTimeout(() => {
      if (fs.existsSync(backupPath)) {
        try {
          fs.unlinkSync(backupPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Failed to write manifest:', error.message);
    
    // Restore from backup if available
    const backupPath = MANIFEST_PATH + '.backup';
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, MANIFEST_PATH);
        console.log('🔄 Restored from backup');
      } catch (e) {
        console.error('❌ Failed to restore backup:', e.message);
      }
    }
    
    process.exit(1);
  }
}

/**
 * Parse semantic version with validation
 */
function parseVersion(version) {
  if (!version || typeof version !== 'string') {
    throw new Error('Invalid version: must be a string');
  }
  
  version = version.trim();
  
  // Validate semver format
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  const match = version.match(semverRegex);
  
  if (!match) {
    throw new Error(`Invalid version format: ${version}. Expected: X.Y.Z`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || '',
    build: match[5] || ''
  };
}

/**
 * Bump version with validation
 */
function bumpVersion(version, type) {
  const validTypes = ['major', 'minor', 'patch'];
  
  if (!validTypes.includes(type)) {
    console.error('❌ Invalid bump type. Use: major, minor, or patch');
    process.exit(1);
  }
  
  try {
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
    }
    
    // Drop prerelease and build metadata on bump
    const newVersion = `${v.major}.${v.minor}.${v.patch}`;
    
    // Validate new version
    parseVersion(newVersion);
    
    return newVersion;
  } catch (error) {
    console.error('❌ Failed to bump version:', error.message);
    process.exit(1);
  }
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
 * Calculate file hash with SHA-256 (more secure than MD5)
 */
function calculateFileHash(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return 'missing';
    }
    
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      console.warn(`⚠️  File is empty: ${filePath}`);
      return 'empty';
    }
    
    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      console.warn(`⚠️  File too large: ${filePath}`);
      return 'too-large';
    }
    
    const content = fs.readFileSync(fullPath);
    
    // Use SHA-256 instead of MD5 for better security
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  } catch (error) {
    console.warn(`⚠️  Could not hash ${filePath}:`, error.message);
    return 'error';
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
 * Validate environment
 */
function validateEnvironment() {
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  
  if (majorVersion < 12) {
    console.error('❌ Node.js 12 or higher required. Current:', nodeVersion);
    process.exit(1);
  }
  
  // Check if manifest exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ version-manifest.json not found');
    console.error('   Run this script from the project root directory');
    process.exit(1);
  }
  
  return true;
}

/**
 * Main function with comprehensive error handling
 */
function main() {
  try {
    // Validate environment
    validateEnvironment();
    
    const args = process.argv.slice(2);
    const bumpType = args[0] || 'patch';
    
    console.log('🚀 Auto-Update Version Builder v2.0.0\n');
    
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
    console.log('\n📝 Calculating file hashes (SHA-256)...');
    updateFileHashes(manifest);
    
    // Add changelog entry
    if (!manifest.changelog) {
      manifest.changelog = [];
    }
    
    const changelogEntry = `Version ${newVersion} - ${new Date().toLocaleDateString()}`;
    
    // Avoid duplicate entries
    if (manifest.changelog[0] !== changelogEntry) {
      manifest.changelog.unshift(changelogEntry);
    }
    
    // Keep only last 10 changelog entries
    if (manifest.changelog.length > 10) {
      manifest.changelog = manifest.changelog.slice(0, 10);
    }
    
    // Write manifest atomically
    console.log('\n💾 Writing manifest...');
    writeManifest(manifest);
    
    console.log('\n✨ Version bump complete!\n');
    console.log('📋 Summary:');
    console.log(`   Old version: ${oldVersion}`);
    console.log(`   New version: ${newVersion}`);
    console.log(`   Build: ${buildNumber}`);
    console.log(`   Files hashed: ${Object.keys(manifest.files || {}).length}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Review changes in version-manifest.json');
    console.log('   2. Test locally before deploying');
    console.log('   3. Commit changes: git add version-manifest.json && git commit -m "Bump version to ' + newVersion + '"');
    console.log('   4. Deploy to your server');
    console.log('   5. Users will automatically receive the update\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run
main();
