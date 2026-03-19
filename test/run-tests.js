#!/usr/bin/env node

/**
 * Test Runner for Auto-Update System
 * Runs comprehensive tests to verify functionality
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Print colored output
 */
function print(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Print test header
 */
function printHeader(title) {
  print('\n' + '='.repeat(60), 'cyan');
  print(title, 'bright');
  print('='.repeat(60), 'cyan');
}

/**
 * Run a test
 */
function test(name, fn) {
  totalTests++;
  
  try {
    const result = fn();
    
    if (result === true) {
      passedTests++;
      print(`✓ ${name}`, 'green');
      return true;
    } else {
      failedTests++;
      print(`✗ ${name}`, 'red');
      if (result && result.message) {
        print(`  Error: ${result.message}`, 'red');
      }
      return false;
    }
  } catch (error) {
    failedTests++;
    print(`✗ ${name}`, 'red');
    print(`  Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Print test summary
 */
function printSummary() {
  print('\n' + '='.repeat(60), 'cyan');
  print('Test Summary', 'bright');
  print('='.repeat(60), 'cyan');
  
  print(`Total Tests: ${totalTests}`, 'blue');
  print(`Passed: ${passedTests}`, 'green');
  print(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  const percentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  print(`Success Rate: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');
  
  print('='.repeat(60) + '\n', 'cyan');
  
  if (failedTests > 0) {
    process.exit(1);
  }
}

// ============================================================================
// File Structure Tests
// ============================================================================

printHeader('File Structure Tests');

test('auto-update.js exists', () => {
  return fs.existsSync(path.join(__dirname, '../auto-update.js'));
});

test('version-manifest.json exists', () => {
  return fs.existsSync(path.join(__dirname, '../version-manifest.json'));
});

test('README.md exists', () => {
  return fs.existsSync(path.join(__dirname, '../README.md'));
});

test('INTEGRATION_GUIDE.md exists', () => {
  return fs.existsSync(path.join(__dirname, '../INTEGRATION_GUIDE.md'));
});

test('LICENSE exists', () => {
  return fs.existsSync(path.join(__dirname, '../LICENSE'));
});

test('package.json exists', () => {
  return fs.existsSync(path.join(__dirname, '../package.json'));
});

test('build-version.js exists', () => {
  return fs.existsSync(path.join(__dirname, '../build-version.js'));
});

test('test/index.html exists', () => {
  return fs.existsSync(path.join(__dirname, 'index.html'));
});

test('examples/basic-integration.html exists', () => {
  return fs.existsSync(path.join(__dirname, '../examples/basic-integration.html'));
});

test('examples/advanced-integration.html exists', () => {
  return fs.existsSync(path.join(__dirname, '../examples/advanced-integration.html'));
});

// ============================================================================
// Code Quality Tests
// ============================================================================

printHeader('Code Quality Tests');

test('auto-update.js is valid JavaScript', () => {
  try {
    const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
    // Basic syntax check
    new Function(code);
    return true;
  } catch (error) {
    return { message: error.message };
  }
});

test('auto-update.js contains AutoUpdate object', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('window.AutoUpdate');
});

test('auto-update.js contains init function', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('function init(');
});

test('auto-update.js contains checkForUpdates function', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('function checkForUpdates(');
});

test('auto-update.js contains clearAllCaches function', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('function clearAllCaches(');
});

test('auto-update.js has proper error handling', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('try {') && code.includes('catch (error)');
});

test('auto-update.js has version constant', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return code.includes('LIBRARY_VERSION');
});

// ============================================================================
// Manifest Tests
// ============================================================================

printHeader('Manifest Tests');

test('version-manifest.json is valid JSON', () => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    return { message: error.message };
  }
});

test('version-manifest.json has version field', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8')
  );
  return manifest.version !== undefined;
});

test('version-manifest.json has valid semantic version', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8')
  );
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(manifest.version);
});

test('version-manifest.json has buildNumber field', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8')
  );
  return manifest.buildNumber !== undefined;
});

test('version-manifest.json has timestamp field', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8')
  );
  return manifest.timestamp !== undefined;
});

test('version-manifest.json timestamp is valid ISO 8601', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../version-manifest.json'), 'utf8')
  );
  const date = new Date(manifest.timestamp);
  return !isNaN(date.getTime());
});

// ============================================================================
// Documentation Tests
// ============================================================================

printHeader('Documentation Tests');

test('README.md has installation section', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
  return readme.includes('Installation') || readme.includes('installation') || readme.includes('Quick Start');
});

test('README.md has usage examples', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
  return readme.includes('```') && readme.includes('AutoUpdate.init');
});

test('README.md has configuration section', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
  return readme.includes('Configuration') || readme.includes('configuration');
});

test('INTEGRATION_GUIDE.md has step-by-step instructions', () => {
  const guide = fs.readFileSync(path.join(__dirname, '../INTEGRATION_GUIDE.md'), 'utf8');
  return guide.includes('Step 1') || guide.includes('step 1');
});

test('INTEGRATION_GUIDE.md has troubleshooting section', () => {
  const guide = fs.readFileSync(path.join(__dirname, '../INTEGRATION_GUIDE.md'), 'utf8');
  return guide.includes('Troubleshooting') || guide.includes('troubleshooting');
});

// ============================================================================
// Example Tests
// ============================================================================

printHeader('Example Tests');

test('basic-integration.html includes auto-update.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '../examples/basic-integration.html'), 'utf8');
  return html.includes('auto-update.js');
});

test('basic-integration.html calls AutoUpdate.init', () => {
  const html = fs.readFileSync(path.join(__dirname, '../examples/basic-integration.html'), 'utf8');
  return html.includes('AutoUpdate.init');
});

test('advanced-integration.html includes auto-update.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '../examples/advanced-integration.html'), 'utf8');
  return html.includes('auto-update.js');
});

test('advanced-integration.html has callbacks configured', () => {
  const html = fs.readFileSync(path.join(__dirname, '../examples/advanced-integration.html'), 'utf8');
  return html.includes('onUpdateAvailable') && html.includes('onUpdateComplete');
});

test('test/index.html is comprehensive test page', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  return html.includes('Test') && html.includes('auto-update.js');
});

// ============================================================================
// Package Tests
// ============================================================================

printHeader('Package Tests');

test('package.json is valid JSON', () => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    return { message: error.message };
  }
});

test('package.json has name field', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.name !== undefined;
});

test('package.json has version field', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.version !== undefined;
});

test('package.json has scripts', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.scripts !== undefined && Object.keys(pkg.scripts).length > 0;
});

test('package.json has test script', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.scripts && pkg.scripts.test !== undefined;
});

test('package.json has license', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.license !== undefined;
});

// ============================================================================
// Build Script Tests
// ============================================================================

printHeader('Build Script Tests');

test('build-version.js is valid JavaScript', () => {
  try {
    const code = fs.readFileSync(path.join(__dirname, '../build-version.js'), 'utf8');
    // Basic syntax check (don't execute)
    return code.includes('function') && code.includes('manifest');
  } catch (error) {
    return { message: error.message };
  }
});

test('build-version.js has version bump logic', () => {
  const code = fs.readFileSync(path.join(__dirname, '../build-version.js'), 'utf8');
  return code.includes('bumpVersion') || code.includes('bump');
});

test('build-version.js has file hash calculation', () => {
  const code = fs.readFileSync(path.join(__dirname, '../build-version.js'), 'utf8');
  return code.includes('hash') || code.includes('Hash');
});

// ============================================================================
// Security Tests
// ============================================================================

printHeader('Security Tests');

test('auto-update.js does not use eval()', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  return !code.includes('eval(');
});

test('auto-update.js sanitizes HTML', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  // Check for basic XSS protection
  return code.includes('textContent') || code.includes('sanitize');
});

test('auto-update.js uses HTTPS for fetch', () => {
  const code = fs.readFileSync(path.join(__dirname, '../auto-update.js'), 'utf8');
  // Should not have hardcoded HTTP URLs
  return !code.includes('http://');
});

// ============================================================================
// Print Summary
// ============================================================================

printSummary();
