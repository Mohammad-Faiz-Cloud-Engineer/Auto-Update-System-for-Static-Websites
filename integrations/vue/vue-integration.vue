<!--
  Vue Integration Example
  Auto-Update System for Vue Applications
-->

<template>
  <div class="app">
    <header>
      <h1>My Vue App</h1>
      <div class="version">Version: {{ currentVersion || '1.0.0' }}</div>
      <button @click="checkForUpdates">Check for Updates</button>
    </header>

    <main>
      <!-- Your app content -->
      <slot />
    </main>

    <!-- Update Notification -->
    <transition name="slide-up">
      <div v-if="showNotification" class="update-notification">
        <div class="update-content">
          <div class="update-icon">🔄</div>
          <div class="update-text">
            <strong>New version available!</strong>
            <p>Version {{ newVersion }} is ready to install.</p>
          </div>
          <div class="update-actions">
            <button @click="applyUpdate" class="btn-primary">
              Update Now
            </button>
            <button @click="dismissNotification" class="btn-secondary">
              Later
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App',
  
  data() {
    return {
      updateAvailable: false,
      currentVersion: null,
      newVersion: null,
      showNotification: false,
      isEnabled: true
    };
  },

  mounted() {
    this.initAutoUpdate();
  },

  beforeUnmount() {
    if (window.AutoUpdate) {
      window.AutoUpdate.destroy();
    }
  },

  methods: {
    initAutoUpdate() {
      if (!window.AutoUpdate) {
        console.error('AutoUpdate not loaded');
        return;
      }

      window.AutoUpdate.init({
        manifestUrl: '/version-manifest.json',
        checkInterval: 30000,
        forceUpdate: false,
        showNotification: false,
        debug: process.env.NODE_ENV === 'development',
        rolloutPercentage: 1.0, // 100% rollout
        
        onUpdateAvailable: (newVersion, oldVersion) => {
          this.updateAvailable = true;
          this.currentVersion = oldVersion;
          this.newVersion = newVersion;
          this.showNotification = true;
          
          // Emit event for parent components
          this.$emit('update-available', { newVersion, oldVersion });
        },
        
        onUpdateComplete: (version) => {
          this.updateAvailable = false;
          this.currentVersion = version;
          this.showNotification = false;
          
          this.$emit('update-complete', { version });
        },
        
        onError: (error) => {
          console.error('Auto-update error:', error);
          this.$emit('update-error', { error });
        }
      });

      // Get initial version
      this.currentVersion = window.AutoUpdate.getVersion();
    },

    checkForUpdates() {
      if (window.AutoUpdate) {
        window.AutoUpdate.checkNow();
      }
    },

    applyUpdate() {
      this.showNotification = false;
      if (window.AutoUpdate) {
        window.AutoUpdate.applyUpdate();
      }
    },

    dismissNotification() {
      this.showNotification = false;
    },

    enableAutoUpdate() {
      if (window.AutoUpdate) {
        window.AutoUpdate.enable();
        this.isEnabled = true;
      }
    },

    disableAutoUpdate() {
      if (window.AutoUpdate) {
        window.AutoUpdate.disable();
        this.isEnabled = false;
      }
    }
  }
};
</script>

<script setup>
/**
 * Vue 3 Composition API Example
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useAutoUpdate(config = {}) {
  const updateAvailable = ref(false);
  const currentVersion = ref(null);
  const newVersion = ref(null);
  const isEnabled = ref(true);

  const initAutoUpdate = () => {
    if (!window.AutoUpdate) {
      console.error('AutoUpdate not loaded');
      return;
    }

    window.AutoUpdate.init({
      manifestUrl: '/version-manifest.json',
      checkInterval: 30000,
      forceUpdate: false,
      showNotification: false,
      debug: import.meta.env.DEV,
      ...config,
      
      onUpdateAvailable: (newVer, oldVer) => {
        updateAvailable.value = true;
        currentVersion.value = oldVer;
        newVersion.value = newVer;
        
        if (config.onUpdateAvailable) {
          config.onUpdateAvailable(newVer, oldVer);
        }
      },
      
      onUpdateComplete: (version) => {
        updateAvailable.value = false;
        currentVersion.value = version;
        
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
    });

    currentVersion.value = window.AutoUpdate.getVersion();
  };

  const checkNow = () => {
    if (window.AutoUpdate) {
      window.AutoUpdate.checkNow();
    }
  };

  const applyUpdate = () => {
    if (window.AutoUpdate) {
      window.AutoUpdate.applyUpdate();
    }
  };

  const enable = () => {
    if (window.AutoUpdate) {
      window.AutoUpdate.enable();
      isEnabled.value = true;
    }
  };

  const disable = () => {
    if (window.AutoUpdate) {
      window.AutoUpdate.disable();
      isEnabled.value = false;
    }
  };

  onMounted(() => {
    initAutoUpdate();
  });

  onBeforeUnmount(() => {
    if (window.AutoUpdate) {
      window.AutoUpdate.destroy();
    }
  });

  return {
    updateAvailable,
    currentVersion,
    newVersion,
    isEnabled,
    checkNow,
    applyUpdate,
    enable,
    disable
  };
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 20px;
  max-width: 420px;
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.update-icon {
  font-size: 48px;
}

.update-text strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.update-text p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.update-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>

<!--
  Usage in main.js:
  
  import { createApp } from 'vue';
  import App from './App.vue';
  
  // Load AutoUpdate script
  const script = document.createElement('script');
  script.src = '/auto-update.js';
  document.head.appendChild(script);
  
  createApp(App).mount('#app');
-->
