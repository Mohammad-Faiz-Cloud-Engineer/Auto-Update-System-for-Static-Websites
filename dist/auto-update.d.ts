/**
 * Auto-Update System for Static Websites
 * TypeScript Definitions
 * 
 * @version 2.2.0
 * @license MIT
 */

declare namespace AutoUpdate {
  /**
   * Configuration options for the auto-update system
   */
  interface AutoUpdateConfig {
    /**
     * URL to the version manifest file (required)
     */
    manifestUrl: string;

    /**
     * How often to check for updates in milliseconds
     * @default 30000 (30 seconds)
     */
    checkInterval?: number;

    /**
     * Automatically reload the page when an update is found
     * @default true
     */
    forceUpdate?: boolean;

    /**
     * Show a notification when an update is available
     * @default true
     */
    showNotification?: boolean;

    /**
     * Enable debug logging to console
     * @default false
     */
    debug?: boolean;

    /**
     * Custom notification message (supports {oldVersion} and {newVersion} placeholders)
     * @default "New version available!"
     */
    notificationMessage?: string;

    /**
     * How long to show the notification (0 = until user action)
     * @default 0
     */
    notificationDuration?: number;

    /**
     * Number of times to retry failed update checks
     * @default 3
     */
    retryAttempts?: number;

    /**
     * Delay between retry attempts in milliseconds
     * @default 5000
     */
    retryDelay?: number;

    /**
     * Percentage of users to update (0-1 for progressive rollout)
     * @default 1 (100% of users)
     */
    rolloutPercentage?: number;

    /**
     * Enable Service Worker integration (v2.2)
     * @default true
     */
    serviceWorker?: boolean;

    /**
     * Service Worker script URL (v2.2)
     * @default '/auto-update-sw.js'
     */
    serviceWorkerUrl?: string;

    /**
     * Enable offline-first mode (v2.2)
     * @default true
     */
    offlineFirst?: boolean;

    /**
     * Enable background sync (v2.2)
     * @default true
     */
    backgroundSync?: boolean;

    /**
     * Enable delta updates - only download changed files (v2.2)
     * @default true
     */
    deltaUpdates?: boolean;

    /**
     * URLs to precache on Service Worker install (v2.2)
     * @default []
     */
    precacheUrls?: string[];

    /**
     * Callback fired when an update is available
     */
    onUpdateAvailable?: (newVersion: string, oldVersion: string) => void;

    /**
     * Callback fired when an update is complete
     */
    onUpdateComplete?: (version: string) => void;

    /**
     * Callback fired when an error occurs
     */
    onError?: (error: Error) => void;

    /**
     * Callback fired when Service Worker updates (v2.2)
     */
    onServiceWorkerUpdate?: (worker: ServiceWorker) => void;
  }

  /**
   * Version manifest structure
   */
  interface Manifest {
    /**
     * Current version (semantic versioning)
     */
    version: string;

    /**
     * Build number
     */
    buildNumber: string;

    /**
     * ISO 8601 timestamp
     */
    timestamp: string;

    /**
     * Optional description
     */
    description?: string;

    /**
     * File hashes for integrity verification
     */
    files?: Record<string, string>;

    /**
     * Changelog entries
     */
    changelog?: string[];

    /**
     * Optional signature for manifest verification
     */
    signature?: string;
  }

  /**
   * Auto-Update API interface
   */
  interface AutoUpdateAPI {
    /**
     * Library version
     */
    version: string;

    /**
     * Initialize the auto-update system
     * @param config Configuration options
     * @returns true if initialization succeeded, false otherwise
     */
    init(config: AutoUpdateConfig): boolean;

    /**
     * Destroy the auto-update system and clean up resources
     */
    destroy(): void;

    /**
     * Manually trigger an update check
     * @returns Promise that resolves when check is complete
     */
    checkNow(): Promise<void>;

    /**
     * Force apply an update immediately
     * @returns Promise that resolves when update is applied
     */
    applyUpdate(): Promise<void>;

    /**
     * Get the current version
     * @returns Current version string or null if not set
     */
    getVersion(): string | null;

    /**
     * Enable the auto-update system
     */
    enable(): void;

    /**
     * Disable the auto-update system
     */
    disable(): void;

    /**
     * Check if the auto-update system is enabled
     * @returns true if enabled, false otherwise
     */
    isEnabled(): boolean;
  }

  /**
   * Library version
   */
  const version: string;

  /**
   * Initialize the auto-update system
   * @param config Configuration options
   * @returns true if initialization succeeded, false otherwise
   */
  function init(config: AutoUpdateConfig): boolean;

  /**
   * Destroy the auto-update system and clean up resources
   */
  function destroy(): void;

  /**
   * Manually trigger an update check
   * @returns Promise that resolves when check is complete
   */
  function checkNow(): Promise<void>;

  /**
   * Force apply an update immediately
   * @returns Promise that resolves when update is applied
   */
  function applyUpdate(): Promise<void;

  /**
   * Get the current version
   * @returns Current version string or null if not set
   */
  function getVersion(): string | null;

  /**
   * Enable the auto-update system
   */
  function enable(): void;

  /**
   * Disable the auto-update system
   */
  function disable(): void;

  /**
   * Check if the auto-update system is enabled
   * @returns true if enabled, false otherwise
   */
  function isEnabled(): boolean;

  /**
   * Get Service Worker registration (v2.2)
   * @returns ServiceWorkerRegistration or null
   */
  function getServiceWorker(): ServiceWorkerRegistration | null;

  /**
   * Check if app is offline (v2.2)
   * @returns true if offline, false if online
   */
  function isOffline(): boolean;

  /**
   * Manually trigger background sync (v2.2)
   * @returns Promise that resolves when sync is registered
   */
  function syncNow(): Promise<boolean>;
}

/**
 * Global AutoUpdate object
 */
declare const AutoUpdate: typeof AutoUpdate;

/**
 * AMD module definition
 */
declare module 'auto-update' {
  export = AutoUpdate;
}

/**
 * ES module definition
 */
export as namespace AutoUpdate;
export = AutoUpdate;
