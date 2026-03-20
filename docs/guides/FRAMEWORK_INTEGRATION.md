# Framework Integration

How to use auto-updates with React, Vue, and Angular.

## React

### Installation

Copy `integrations/react/react-integration.jsx` to your project.

### Usage

```jsx
import { useAutoUpdate } from './integrations/react/react-integration';

function App() {
  const { 
    updateAvailable, 
    applyUpdate,
    currentVersion,
    newVersion 
  } = useAutoUpdate({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000
  });

  return (
    <div>
      <h1>My App v{currentVersion}</h1>
      
      {updateAvailable && (
        <div className="update-banner">
          <p>Version {newVersion} is available!</p>
          <button onClick={applyUpdate}>Update Now</button>
        </div>
      )}
      
      {/* Your app content */}
    </div>
  );
}
```

### With Notification Component

```jsx
import { useAutoUpdate, UpdateNotification } from './integrations/react/react-integration';

function App() {
  const { updateAvailable, applyUpdate } = useAutoUpdate();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) setShowNotification(true);
  }, [updateAvailable]);

  return (
    <div>
      {/* Your app */}
      
      {showNotification && (
        <UpdateNotification
          onUpdate={() => {
            setShowNotification(false);
            applyUpdate();
          }}
          onDismiss={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}
```

## Vue

### Installation

Copy `integrations/vue/vue-integration.vue` to your project.

### Vue 3 (Composition API)

```vue
<script setup>
import { useAutoUpdate } from './integrations/vue/vue-integration';

const { 
  updateAvailable, 
  applyUpdate,
  currentVersion,
  newVersion 
} = useAutoUpdate({
  manifestUrl: '/version-manifest.json'
});
</script>

<template>
  <div>
    <h1>My App v{{ currentVersion }}</h1>
    
    <div v-if="updateAvailable" class="update-banner">
      <p>Version {{ newVersion }} is available!</p>
      <button @click="applyUpdate">Update Now</button>
    </div>
    
    <!-- Your app content -->
  </div>
</template>
```

### Vue 2 (Options API)

```vue
<template>
  <div>
    <h1>My App v{{ currentVersion }}</h1>
    
    <div v-if="updateAvailable" class="update-banner">
      <p>Version {{ newVersion }} is available!</p>
      <button @click="applyUpdate">Update Now</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      updateAvailable: false,
      currentVersion: null,
      newVersion: null
    };
  },
  
  mounted() {
    this.initAutoUpdate();
  },
  
  beforeUnmount() {
    window.AutoUpdate?.destroy();
  },
  
  methods: {
    initAutoUpdate() {
      window.AutoUpdate.init({
        manifestUrl: '/version-manifest.json',
        showNotification: false,
        forceUpdate: false,
        
        onUpdateAvailable: (newVer, oldVer) => {
          this.updateAvailable = true;
          this.currentVersion = oldVer;
          this.newVersion = newVer;
        }
      });
    },
    
    applyUpdate() {
      window.AutoUpdate.applyUpdate();
    }
  }
};
</script>
```

## Angular

### Installation

1. Copy `integrations/angular/angular-integration.ts` to your project
2. Add to `app.module.ts`:

```typescript
import { AutoUpdateService } from './integrations/angular/angular-integration';

@NgModule({
  providers: [AutoUpdateService]
})
export class AppModule { }
```

### Usage in Component

```typescript
import { Component } from '@angular/core';
import { AutoUpdateService } from './integrations/angular/angular-integration';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>My App v{{ currentVersion$ | async }}</h1>
      
      <div *ngIf="updateAvailable$ | async" class="update-banner">
        <p>Version {{ newVersion$ | async }} is available!</p>
        <button (click)="applyUpdate()">Update Now</button>
      </div>
      
      <!-- Your app content -->
    </div>
  `
})
export class AppComponent {
  updateAvailable$ = this.autoUpdate.updateAvailable$;
  currentVersion$ = this.autoUpdate.currentVersion$;
  newVersion$ = this.autoUpdate.newVersion$;

  constructor(private autoUpdate: AutoUpdateService) {}

  applyUpdate() {
    this.autoUpdate.applyUpdate();
  }
}
```

### With Notification Component

```typescript
import { UpdateNotificationComponent } from './integrations/angular/angular-integration';

@NgModule({
  declarations: [
    AppComponent,
    UpdateNotificationComponent  // Add this
  ]
})
export class AppModule { }
```

Then in your template:

```html
<app-update-notification></app-update-notification>
```

## TypeScript

If you're using TypeScript, copy `types/auto-update.d.ts` to your project for full type support.

```typescript
import { AutoUpdate } from 'auto-update';

// Full autocomplete and type checking
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,
  onUpdateAvailable: (newVer: string, oldVer: string) => {
    console.log(`Update: ${oldVer} → ${newVer}`);
  }
});
```

## Common Patterns

### Show Update Banner

```javascript
// React
{updateAvailable && <UpdateBanner />}

// Vue
<div v-if="updateAvailable">...</div>

// Angular
<div *ngIf="updateAvailable$ | async">...</div>
```

### Manual Check Button

```javascript
// React
<button onClick={() => AutoUpdate.checkNow()}>
  Check for Updates
</button>

// Vue
<button @click="checkForUpdates">
  Check for Updates
</button>

// Angular
<button (click)="checkForUpdates()">
  Check for Updates
</button>
```

### Disable Auto-Updates

```javascript
// React
useEffect(() => {
  AutoUpdate.disable();
  return () => AutoUpdate.enable();
}, []);

// Vue
onMounted(() => AutoUpdate.disable());
onUnmounted(() => AutoUpdate.enable());

// Angular
ngOnInit() {
  this.autoUpdate.disable();
}
```

## Troubleshooting

### Hook Not Working (React)

Make sure `auto-update.js` is loaded before your React app:

```html
<script src="/auto-update.js"></script>
<script src="/your-react-app.js"></script>
```

### Composable Not Working (Vue)

Same as React - load the script first.

### Service Not Injecting (Angular)

Make sure `AutoUpdateService` is in your module's `providers` array.

### TypeScript Errors

Copy `types/auto-update.d.ts` to your project and add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  }
}
```
