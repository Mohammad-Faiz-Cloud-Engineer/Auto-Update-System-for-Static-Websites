/**
 * Auto-Update System for Static Websites
 * 
 * Automatically detects and applies updates to static websites by checking
 * version manifests and clearing browser caches when new versions are available.
 * 
 * @version 1.0.0
 * @license MIT
 * @author Mohammad Faiz
 * @repository https://github.com/Mohammad-Faiz-Cloud-Engineer/Auto-Update-System-for-Static-Websites
 */

(function(window) {
  'use strict';

  // Version
  const LIBRARY_VERSION = '1.0.0';
  
  // Storage keys
  const STORAGE_KEY_VERSION = 'auto_update_current_version';
  const STORAGE_KEY_LAST_CHECK = 'auto_update_last_check';
  const STORAGE_KEY_ENABLED = 'auto_update_enabled';
  
  // Default configuration
  const DEFAULT_CONFIG = {
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000,        // 30 seconds
    forceUpdate: true,            // Auto-reload on update
    showNotification: true,       // Show update notification
    debug: false,                 // Debug logging
    notificationMessage: 'New version available!',
    notificationDuration: 0,      // 0 = stay until action (milliseconds)
    retryAttempts: 3,             // Retry failed checks
    retryDelay: 5000,             // Delay between retries (ms)
    onUpdateAvailable: null,      // Callback
    onUpdateComplete: null,       // Callback
    onError: null                 // Callback
  };
  
  // State
  let config = { ...DEFAULT_CONFIG };
  let checkIntervalId = null;
  let currentVersion = null;
  let isChecking = false;
  let retryCount = 0;
  
  /**
   * Log debug messages
   */
  function log(...args) {
    if (config.debug) {
      console.log('[AutoUpdate]', ...args);
    }
  }
  
  /**
   * Log errors
   */
  function logError(...args) {
    console.error('[AutoUpdate]', ...args);
  }
  
  /**
   * Get stored version from localStorage
   */
  function getStoredVersion() {
    try {
      return localStorage.getItem(STORAGE_KEY_VERSION);
    } catch (e) {
      logError('Failed to read from localStorage:', e);
      return null;
    }
  }
  
  /**
   * Store version in localStorage
   */
  function setStoredVersion(version) {
    try {
      localStorage.setItem(STORAGE_KEY_VERSION, version);
      localStorage.setItem(STORAGE_KEY_LAST_CHECK, Date.now().toString());
      log('Stored version:', version);
    } catch (e) {
      logError('Failed to write to localStorage:', e);
    }
  }
  
  /**
   * Check if auto-update is enabled
   */
  function isEnabled() {
    try {
      const enabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      return enabled === null || enabled === 'true';
    } catch (e) {
      return true;
    }
  }
  
  /**
   * Enable/disable auto-update
   */
  function setEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, enabled.toString());
      log('Auto-update', enabled ? 'enabled' : 'disabled');
    } catch (e) {
      logError('Failed to update enabled state:', e);
    }
  }
  
  /**
   * Fetch version manifest from server
   */
  async function fetchManifest() {
    const cacheBuster = `?t=${Date.now()}`;
    const url = config.manifestUrl + cacheBuster;
    
    log('Fetching manifest from:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const manifest = await response.json();
      
      // Validate manifest structure
      if (!manifest.version) {
        throw new Error('Invalid manifest: missing version field');
      }
      
      log('Manifest fetched:', manifest);
      return manifest;
      
    } catch (error) {
      logError('Failed to fetch manifest:', error);
      throw error;
    }
  }
  
  /**
   * Compare versions
   * Returns: -1 (older), 0 (same), 1 (newer)
   */
  function compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    
    // Try semantic versioning comparison
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    // If semantic version is same, compare as strings
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
    
    return 0;
  }
  
  /**
   * Clear all browser caches
   */
  async function clearAllCaches() {
    log('Clearing all caches...');
    
    try {
      // Clear Cache API (Service Worker caches)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        log('Cache API cleared');
      }
      
      // Clear Service Worker registration (optional - forces SW update)
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          log('Unregistering service worker');
          await registration.unregister();
        }
      }
      
      log('All caches cleared successfully');
      return true;
      
    } catch (error) {
      logError('Failed to clear caches:', error);
      return false;
    }
  }
  
  /**
   * Show update notification to user
   */
  function showUpdateNotification(newVersion, oldVersion) {
    if (!config.showNotification) return;
    
    log('Showing update notification');
    
    // Remove existing notification if any
    const existing = document.getElementById('auto-update-notification');
    if (existing) {
      existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'auto-update-notification';
    notification.className = 'auto-update-notification';
    
    const message = config.notificationMessage
      .replace('{oldVersion}', oldVersion || 'unknown')
      .replace('{newVersion}', newVersion || 'unknown');
    
    notification.innerHTML = `
      <div class="auto-update-content">
        <div class="auto-update-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </div>
        <div class="auto-update-text">
          <strong>${message}</strong>
          <p>Click "Update Now" to get the latest version.</p>
        </div>
        <div class="auto-update-actions">
          <button class="auto-update-btn auto-update-btn-primary" id="auto-update-now">
            Update Now
          </button>
          <button class="auto-update-btn auto-update-btn-secondary" id="auto-update-later">
            Later
          </button>
        </div>
      </div>
    `;
    
    // Add styles
    addNotificationStyles();
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('auto-update-visible');
    }, 100);
    
    // Button handlers
    const updateBtn = document.getElementById('auto-update-now');
    const laterBtn = document.getElementById('auto-update-later');
    
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        applyUpdate();
      });
    }
    
    if (laterBtn) {
      laterBtn.addEventListener('click', () => {
        dismissNotification();
      });
    }
    
    // Auto-dismiss after duration (if set)
    if (config.notificationDuration > 0) {
      setTimeout(() => {
        dismissNotification();
      }, config.notificationDuration);
    }
  }
  
  /**
   * Dismiss notification
   */
  function dismissNotification() {
    const notification = document.getElementById('auto-update-notification');
    if (notification) {
      notification.classList.remove('auto-update-visible');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }
  
  /**
   * Add notification styles to document
   */
  function addNotificationStyles() {
    // Check if styles already added
    if (document.getElementById('auto-update-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'auto-update-styles';
    style.textContent = `
      .auto-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        padding: 20px;
        max-width: 420px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        border: 1px solid #e5e7eb;
      }
      
      .auto-update-notification.auto-update-visible {
        transform: translateY(0);
        opacity: 1;
      }
      
      .auto-update-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .auto-update-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        animation: auto-update-pulse 2s infinite;
      }
      
      @keyframes auto-update-pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      .auto-update-text {
        flex: 1;
      }
      
      .auto-update-text strong {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
      }
      
      .auto-update-text p {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
        line-height: 1.5;
      }
      
      .auto-update-actions {
        display: flex;
        gap: 12px;
      }
      
      .auto-update-btn {
        flex: 1;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      
      .auto-update-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .auto-update-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      .auto-update-btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .auto-update-btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .auto-update-btn:active {
        transform: translateY(0);
      }
      
      @media (max-width: 640px) {
        .auto-update-notification {
          left: 16px;
          right: 16px;
          bottom: 16px;
          max-width: none;
        }
        
        .auto-update-actions {
          flex-direction: column;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .auto-update-notification {
          background: #1f2937;
          border-color: #374151;
        }
        
        .auto-update-text strong {
          color: #f9fafb;
        }
        
        .auto-update-text p {
          color: #9ca3af;
        }
        
        .auto-update-btn-secondary {
          background: #374151;
          color: #f9fafb;
        }
        
        .auto-update-btn-secondary:hover {
          background: #4b5563;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Apply update - clear caches and reload
   */
  async function applyUpdate() {
    log('Applying update...');
    
    dismissNotification();
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
      // Clear all caches
      await clearAllCaches();
      
      // Call callback
      if (typeof config.onUpdateComplete === 'function') {
        config.onUpdateComplete(currentVersion);
      }
      
      // Force reload with cache bypass
      log('Reloading page...');
      window.location.reload(true);
      
    } catch (error) {
      logError('Failed to apply update:', error);
      hideLoadingIndicator();
      
      // Fallback: just reload
      window.location.reload(true);
    }
  }
  
  /**
   * Show loading indicator
   */
  function showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'auto-update-loader';
    loader.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          padding: 32px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <div style="
            width: 48px;
            height: 48px;
            border: 4px solid #e5e7eb;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: auto-update-spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <p style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          ">Updating...</p>
          <p style="
            margin: 8px 0 0;
            font-size: 14px;
            color: #6b7280;
          ">Please wait</p>
        </div>
      </div>
      <style>
        @keyframes auto-update-spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loader);
  }
  
  /**
   * Hide loading indicator
   */
  function hideLoadingIndicator() {
    const loader = document.getElementById('auto-update-loader');
    if (loader) {
      loader.remove();
    }
  }
  
  /**
   * Check for updates
   */
  async function checkForUpdates() {
    if (isChecking) {
      log('Check already in progress, skipping...');
      return;
    }
    
    if (!isEnabled()) {
      log('Auto-update is disabled');
      return;
    }
    
    isChecking = true;
    log('Checking for updates...');
    
    try {
      // Fetch manifest
      const manifest = await fetchManifest();
      const serverVersion = manifest.version;
      const storedVersion = getStoredVersion();
      
      log('Server version:', serverVersion);
      log('Stored version:', storedVersion);
      
      // First time - just store version
      if (!storedVersion) {
        log('First run - storing version');
        setStoredVersion(serverVersion);
        currentVersion = serverVersion;
        isChecking = false;
        retryCount = 0;
        return;
      }
      
      // Compare versions
      const comparison = compareVersions(serverVersion, storedVersion);
      
      if (comparison > 0) {
        log('🎉 New version available!', storedVersion, '→', serverVersion);
        
        // Update current version
        currentVersion = serverVersion;
        
        // Call callback
        if (typeof config.onUpdateAvailable === 'function') {
          config.onUpdateAvailable(serverVersion, storedVersion);
        }
        
        // Show notification or auto-update
        if (config.forceUpdate) {
          log('Force update enabled - applying immediately');
          await applyUpdate();
        } else {
          showUpdateNotification(serverVersion, storedVersion);
        }
        
        // Store new version
        setStoredVersion(serverVersion);
        
      } else if (comparison < 0) {
        log('⚠️ Server version is older than stored version');
        // This might happen during rollback - update stored version
        setStoredVersion(serverVersion);
        currentVersion = serverVersion;
        
      } else {
        log('✓ Already on latest version');
      }
      
      // Reset retry count on success
      retryCount = 0;
      
    } catch (error) {
      logError('Update check failed:', error);
      
      // Call error callback
      if (typeof config.onError === 'function') {
        config.onError(error);
      }
      
      // Retry logic
      if (retryCount < config.retryAttempts) {
        retryCount++;
        log(`Retrying in ${config.retryDelay}ms (attempt ${retryCount}/${config.retryAttempts})`);
        setTimeout(() => {
          isChecking = false;
          checkForUpdates();
        }, config.retryDelay);
        return;
      } else {
        log('Max retry attempts reached');
        retryCount = 0;
      }
    }
    
    isChecking = false;
  }
  
  /**
   * Start periodic update checks
   */
  function startUpdateChecks() {
    log('Starting update checks (interval:', config.checkInterval, 'ms)');
    
    // Initial check
    checkForUpdates();
    
    // Periodic checks
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
    }
    
    checkIntervalId = setInterval(() => {
      checkForUpdates();
    }, config.checkInterval);
    
    // Check on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        log('Page became visible - checking for updates');
        checkForUpdates();
      }
    });
    
    // Check on online event
    window.addEventListener('online', () => {
      log('Network connection restored - checking for updates');
      checkForUpdates();
    });
  }
  
  /**
   * Stop update checks
   */
  function stopUpdateChecks() {
    log('Stopping update checks');
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
      checkIntervalId = null;
    }
  }
  
  /**
   * Initialize auto-update system
   */
  function init(userConfig = {}) {
    log('Initializing Auto-Update System v' + LIBRARY_VERSION);
    
    // Merge config
    config = { ...DEFAULT_CONFIG, ...userConfig };
    
    // Validate config
    if (!config.manifestUrl) {
      logError('manifestUrl is required');
      return false;
    }
    
    log('Configuration:', config);
    
    // Start checks
    startUpdateChecks();
    
    return true;
  }
  
  /**
   * Destroy auto-update system
   */
  function destroy() {
    log('Destroying Auto-Update System');
    stopUpdateChecks();
    dismissNotification();
    hideLoadingIndicator();
  }
  
  /**
   * Get current version
   */
  function getVersion() {
    return currentVersion || getStoredVersion();
  }
  
  /**
   * Manually trigger update check
   */
  function checkNow() {
    log('Manual update check triggered');
    return checkForUpdates();
  }
  
  /**
   * Enable auto-update
   */
  function enable() {
    setEnabled(true);
    startUpdateChecks();
  }
  
  /**
   * Disable auto-update
   */
  function disable() {
    setEnabled(false);
    stopUpdateChecks();
  }
  
  // Public API
  const AutoUpdate = {
    version: LIBRARY_VERSION,
    init,
    destroy,
    checkNow,
    applyUpdate,
    getVersion,
    enable,
    disable,
    isEnabled
  };
  
  // Export to window
  window.AutoUpdate = AutoUpdate;
  
  // AMD support
  if (typeof define === 'function' && define.amd) {
    define(function() { return AutoUpdate; });
  }
  
  // CommonJS support
  if (typeof module === 'object' && module.exports) {
    module.exports = AutoUpdate;
  }
  
  log('Auto-Update System loaded');
  
})(window);
