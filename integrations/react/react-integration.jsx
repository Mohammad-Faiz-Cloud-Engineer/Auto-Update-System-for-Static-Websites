/**
 * React Integration Example
 * Auto-Update System for React Applications
 */

import React, { useEffect, useState, useCallback } from 'react';

/**
 * Custom hook for auto-update functionality
 */
export function useAutoUpdate(config = {}) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [newVersion, setNewVersion] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Initialize AutoUpdate
    const autoUpdateConfig = {
      manifestUrl: '/version-manifest.json',
      checkInterval: 30000,
      forceUpdate: false, // Let React handle the UI
      showNotification: false, // Use React component instead
      debug: process.env.NODE_ENV === 'development',
      ...config,
      onUpdateAvailable: (newVer, oldVer) => {
        setUpdateAvailable(true);
        setCurrentVersion(oldVer);
        setNewVersion(newVer);
        
        // Call user's callback if provided
        if (config.onUpdateAvailable) {
          config.onUpdateAvailable(newVer, oldVer);
        }
      },
      onUpdateComplete: (version) => {
        setUpdateAvailable(false);
        setCurrentVersion(version);
        
        if (config.onUpdateComplete) {
          config.onUpdateComplete(version);
        }
      },
      onError: (error) => {
        console.error('Auto-update error:', error);
        
        if (config.onError) {
          config.onError(error);
        }
      }
    };

    window.AutoUpdate.init(autoUpdateConfig);

    // Cleanup on unmount
    return () => {
      window.AutoUpdate.destroy();
    };
  }, [config]);

  const applyUpdate = useCallback(() => {
    window.AutoUpdate.applyUpdate();
  }, []);

  const checkNow = useCallback(() => {
    window.AutoUpdate.checkNow();
  }, []);

  const enable = useCallback(() => {
    window.AutoUpdate.enable();
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    window.AutoUpdate.disable();
    setIsEnabled(false);
  }, []);

  return {
    updateAvailable,
    currentVersion,
    newVersion,
    isEnabled,
    applyUpdate,
    checkNow,
    enable,
    disable
  };
}

/**
 * Update notification component
 */
export function UpdateNotification({ onUpdate, onDismiss }) {
  return (
    <div className="update-notification">
      <div className="update-content">
        <div className="update-icon">🔄</div>
        <div className="update-text">
          <strong>New version available!</strong>
          <p>Click "Update Now" to get the latest version.</p>
        </div>
        <div className="update-actions">
          <button onClick={onUpdate} className="btn-primary">
            Update Now
          </button>
          <button onClick={onDismiss} className="btn-secondary">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example App Component
 */
export default function App() {
  const {
    updateAvailable,
    currentVersion,
    newVersion,
    applyUpdate,
    checkNow
  } = useAutoUpdate({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000,
    rolloutPercentage: 1.0 // 100% rollout
  });

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowNotification(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    setShowNotification(false);
    applyUpdate();
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  return (
    <div className="app">
      <header>
        <h1>My React App</h1>
        <div className="version">
          Version: {currentVersion || '1.0.0'}
        </div>
        <button onClick={checkNow}>Check for Updates</button>
      </header>

      <main>
        {/* Your app content */}
      </main>

      {showNotification && (
        <UpdateNotification
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}

/**
 * Usage in index.js:
 * 
 * import React from 'react';
 * import ReactDOM from 'react-dom/client';
 * import App from './App';
 * 
 * // Load AutoUpdate script
 * const script = document.createElement('script');
 * script.src = '/auto-update.js';
 * document.head.appendChild(script);
 * 
 * const root = ReactDOM.createRoot(document.getElementById('root'));
 * root.render(<App />);
 */
