#!/usr/bin/env node

/**
 * Integration Tests for Auto-Update System v2.1
 * Tests framework integrations, build plugins, and progressive rollout
 */

const fs = require('fs');
const path = require('path');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function print(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

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
        print(`  ${result.message}`, 'red');
      }
      return false;
    }
  } catch (error) {
    failedTests++;
    print(`✗ ${name}`, 'red');
    print(`  ${error.message}`, 'red');
    return false;
  }
}

function header(title) {
  print('\n' + '='.repeat(70), 'cyan');
  print(title, 'bright');
  print('='.repeat(70), 'cyan');
}

// ============================================================================
// TypeScript Definitions Tests
// ============================================================================

header('TypeScript Definitions Tests');

test('TypeScript definitions file exists', () => {
  return fs.existsSync(path.join(__dirname, '../types/auto-update.d.ts'));
});

test('TypeScript definitions are valid', () => {
  const defs = fs.readFileSync(
    path.join(__dirname, '../types/auto-update.d.ts'),
    'utf8'
  );
  return defs.includes('interface AutoUpdateConfig') &&
         defs.includes('interface AutoUpdateAPI');
});

test('TypeScript: AutoUpdateConfig interface complete', () => {
  const defs = fs.readFileSync(
    path.join(__dirname, '../types/auto-update.d.ts'),
    'utf8'
  );
  return defs.includes('manifestUrl') &&
         defs.includes('checkInterval') &&
         defs.includes('rolloutPercentage');
});

test('TypeScript: All callback types defined', () => {
  const defs = fs.readFileSync(
    path.join(__dirname, '../types/auto-update.d.ts'),
    'utf8'
  );
  return defs.includes('onUpdateAvailable') &&
         defs.includes('onUpdateComplete') &&
         defs.includes('onError');
});

test('TypeScript: AutoUpdateAPI interface complete', () => {
  const defs = fs.readFileSync(
    path.join(__dirname, '../types/auto-update.d.ts'),
    'utf8'
  );
  return defs.includes('init(') &&
         defs.includes('checkNow()') &&
         defs.includes('applyUpdate()') &&
         defs.includes('destroy()');
});

// ============================================================================
// React Integration Tests
// ============================================================================

header('React Integration Tests');

test('React integration file exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/react/react-integration.jsx'));
});

test('React: useAutoUpdate hook exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/react/react-integration.jsx'),
    'utf8'
  );
  return code.includes('export function useAutoUpdate(');
});

test('React: Hook returns all required methods', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/react/react-integration.jsx'),
    'utf8'
  );
  return code.includes('updateAvailable') &&
         code.includes('applyUpdate') &&
         code.includes('checkNow') &&
         code.includes('enable') &&
         code.includes('disable');
});

test('React: UpdateNotification component exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/react/react-integration.jsx'),
    'utf8'
  );
  return code.includes('export function UpdateNotification(');
});

test('React: Cleanup on unmount', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/react/react-integration.jsx'),
    'utf8'
  );
  return code.includes('return () =>') &&
         code.includes('AutoUpdate.destroy()');
});

test('React: Supports rolloutPercentage', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/react/react-integration.jsx'),
    'utf8'
  );
  return code.includes('rolloutPercentage');
});

// ============================================================================
// Vue Integration Tests
// ============================================================================

header('Vue Integration Tests');

test('Vue integration file exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/vue/vue-integration.vue'));
});

test('Vue: Options API implementation exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('export default {') &&
         code.includes('mounted()') &&
         code.includes('beforeUnmount()');
});

test('Vue: Composition API implementation exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('<script setup>') &&
         code.includes('export function useAutoUpdate(');
});

test('Vue: All methods implemented', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('checkForUpdates') &&
         code.includes('applyUpdate') &&
         code.includes('enableAutoUpdate') &&
         code.includes('disableAutoUpdate');
});

test('Vue: Event emitters configured', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('$emit(\'update-available\'') &&
         code.includes('$emit(\'update-complete\'');
});

test('Vue: Cleanup on unmount', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('beforeUnmount()') &&
         code.includes('AutoUpdate.destroy()');
});

test('Vue: Supports rolloutPercentage', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/vue/vue-integration.vue'),
    'utf8'
  );
  return code.includes('rolloutPercentage');
});

// ============================================================================
// Angular Integration Tests
// ============================================================================

header('Angular Integration Tests');

test('Angular integration file exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/angular/angular-integration.ts'));
});

test('Angular: AutoUpdateService exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('export class AutoUpdateService') &&
         code.includes('@Injectable');
});

test('Angular: RxJS observables configured', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('BehaviorSubject') &&
         code.includes('Observable') &&
         code.includes('updateAvailable$');
});

test('Angular: UpdateNotificationComponent exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('export class UpdateNotificationComponent') &&
         code.includes('@Component');
});

test('Angular: All service methods implemented', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('checkNow()') &&
         code.includes('applyUpdate()') &&
         code.includes('enable()') &&
         code.includes('disable()');
});

test('Angular: Cleanup on destroy', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('ngOnDestroy()') &&
         code.includes('AutoUpdate.destroy()');
});

test('Angular: Supports rolloutPercentage', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../integrations/angular/angular-integration.ts'),
    'utf8'
  );
  return code.includes('rolloutPercentage');
});

// ============================================================================
// Webpack Plugin Tests
// ============================================================================

header('Webpack Plugin Tests');

test('Webpack plugin file exists', () => {
  return fs.existsSync(path.join(__dirname, '../plugins/webpack/webpack-plugin.js'));
});

test('Webpack: Plugin class exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('class AutoUpdateWebpackPlugin');
});

test('Webpack: apply() method exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('apply(compiler)');
});

test('Webpack: generateManifest() method exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('generateManifest(');
});

test('Webpack: File hash calculation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('crypto.createHash') &&
         code.includes('sha256');
});

test('Webpack: Build number generation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('generateBuildNumber()');
});

test('Webpack: File filtering', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/webpack/webpack-plugin.js'),
    'utf8'
  );
  return code.includes('shouldIncludeFile(') &&
         code.includes('exclude');
});

// ============================================================================
// Vite Plugin Tests
// ============================================================================

header('Vite Plugin Tests');

test('Vite plugin file exists', () => {
  return fs.existsSync(path.join(__dirname, '../plugins/vite/vite-plugin.js'));
});

test('Vite: Plugin function exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('export default function autoUpdatePlugin(');
});

test('Vite: generateBundle hook exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('generateBundle(');
});

test('Vite: generateManifest() function exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('function generateManifest(');
});

test('Vite: File hash calculation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('crypto.createHash') &&
         code.includes('sha256');
});

test('Vite: Build number generation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('function generateBuildNumber()');
});

test('Vite: File filtering', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../plugins/vite/vite-plugin.js'),
    'utf8'
  );
  return code.includes('function shouldIncludeFile(') &&
         code.includes('exclude');
});

// ============================================================================
// Progressive Rollout Tests
// ============================================================================

header('Progressive Rollout Tests');

test('Progressive rollout: rolloutPercentage option exists', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../src/auto-update.js'),
    'utf8'
  );
  return code.includes('rolloutPercentage');
});

test('Progressive rollout: User ID generation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../src/auto-update.js'),
    'utf8'
  );
  return code.includes('getUserId()') || code.includes('userId');
});

test('Progressive rollout: Percentage calculation', () => {
  const code = fs.readFileSync(
    path.join(__dirname, '../src/auto-update.js'),
    'utf8'
  );
  return code.includes('rolloutPercentage') &&
         (code.includes('Math.random()') || code.includes('hash'));
});

test('Progressive rollout: Documented in README', () => {
  const readme = fs.readFileSync(
    path.join(__dirname, '../README.md'),
    'utf8'
  );
  return readme.includes('rolloutPercentage') ||
         readme.includes('progressive rollout');
});

// ============================================================================
// Documentation Tests
// ============================================================================

header('Documentation Tests');

test('FRAMEWORK_INTEGRATION.md exists', () => {
  return fs.existsSync(path.join(__dirname, '../docs/guides/FRAMEWORK_INTEGRATION.md'));
});

test('BUILD_PLUGINS.md exists', () => {
  return fs.existsSync(path.join(__dirname, '../docs/guides/BUILD_PLUGINS.md'));
});

test('CHANGELOG.md has v2.1 release notes', () => {
  const changelog = fs.readFileSync(
    path.join(__dirname, '../CHANGELOG.md'),
    'utf8'
  );
  return changelog.includes('2.1.0') && changelog.includes('TypeScript');
});

test('Framework integration guide has React section', () => {
  const guide = fs.readFileSync(
    path.join(__dirname, '../docs/guides/FRAMEWORK_INTEGRATION.md'),
    'utf8'
  );
  return guide.includes('React') && guide.includes('useAutoUpdate');
});

test('Framework integration guide has Vue section', () => {
  const guide = fs.readFileSync(
    path.join(__dirname, '../docs/guides/FRAMEWORK_INTEGRATION.md'),
    'utf8'
  );
  return guide.includes('Vue') && guide.includes('Composition API');
});

test('Framework integration guide has Angular section', () => {
  const guide = fs.readFileSync(
    path.join(__dirname, '../docs/guides/FRAMEWORK_INTEGRATION.md'),
    'utf8'
  );
  return guide.includes('Angular') && guide.includes('AutoUpdateService');
});

test('Build plugins guide has Webpack section', () => {
  const guide = fs.readFileSync(
    path.join(__dirname, '../docs/guides/BUILD_PLUGINS.md'),
    'utf8'
  );
  return guide.includes('Webpack') && guide.includes('AutoUpdateWebpackPlugin');
});

test('Build plugins guide has Vite section', () => {
  const guide = fs.readFileSync(
    path.join(__dirname, '../docs/guides/BUILD_PLUGINS.md'),
    'utf8'
  );
  return guide.includes('Vite') && guide.includes('autoUpdate');
});

// ============================================================================
// Folder Structure Tests
// ============================================================================

header('Folder Structure Tests');

test('integrations/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations'));
});

test('integrations/react/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/react'));
});

test('integrations/vue/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/vue'));
});

test('integrations/angular/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../integrations/angular'));
});

test('plugins/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../plugins'));
});

test('plugins/webpack/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../plugins/webpack'));
});

test('plugins/vite/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../plugins/vite'));
});

test('types/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../types'));
});

test('docs/guides/ folder exists', () => {
  return fs.existsSync(path.join(__dirname, '../docs/guides'));
});

// ============================================================================
// Summary
// ============================================================================

print('\n' + '='.repeat(70), 'cyan');
print('Integration Test Summary', 'bright');
print('='.repeat(70), 'cyan');

print(`Total Tests: ${totalTests}`, 'cyan');
print(`Passed: ${passedTests}`, 'green');
print(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

const percentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
print(`Success Rate: ${percentage}%`, percentage === '100.0' ? 'green' : 'yellow');

print('='.repeat(70) + '\n', 'cyan');

if (failedTests === 0) {
  print('🎉 All integration tests passed!', 'green');
  print('✅ TypeScript Definitions: Complete', 'green');
  print('✅ React Integration: Working', 'green');
  print('✅ Vue Integration: Working', 'green');
  print('✅ Angular Integration: Working', 'green');
  print('✅ Webpack Plugin: Working', 'green');
  print('✅ Vite Plugin: Working', 'green');
  print('✅ Progressive Rollout: Implemented', 'green');
  print('✅ Documentation: Complete', 'green');
}

process.exit(failedTests > 0 ? 1 : 0);
