# Framework Integration Guide

Complete guide for integrating Auto-Update System with React, Vue, and Angular.

## React Integration

### Installation

```bash
# Add auto-update.js to your public folder
cp auto-update.js public/
cp version-manifest.json public/
```

### Load the Script

In `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
    <script src="%PUBLIC_URL%/auto-update.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Use the Hook

```jsx
import { useAutoUpdate } from './hooks/useAutoUpdate';

function App() {
  const {
    updateAvailable,
    currentVersion,
    newVersion,
    applyUpdate,
    checkNow
  } = useAutoUpdate({
    manifestUrl: '/version-manifest.json',
    checkInterval: 30000,
    rolloutPercentage: 1.0
  });

  return (
    <div>
      <header>
        <h1>My App</h1>
        <span>Version: {currentVersion}</span>
        <button onClick={checkNow}>Check Updates</button>
      </header>

      {updateAvailable && (
        <div className="update-banner">
          <p>Version {newVersion} available!</p>
          <button onClick={applyUpdate}>Update Now</button>
        </div>
      )}
    </div>
  );
}
```

See `examples/react-integration.jsx` for the complete implementation.

---

## Vue Integration

### Installation

```bash
# Add auto-update.js to your public folder
cp auto-update.js public/
cp version-manifest.json public/
```

### Load the Script

In `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Vue App</title>
    <script src="/auto-update.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

### Vue 3 Composition API

```vue
<script setup>
import { useAutoUpdate } from './composables/useAutoUpdate';

const {
  updateAvailable,
  currentVersion,
  newVersion,
  applyUpdate,
  checkNow
} = useAutoUpdate({
  manifestUrl: '/version-manifest.json',
  rolloutPercentage: 1.0
});
</script>

<template>
  <div class="app">
    <header>
      <h1>My App</h1>
      <span>Version: {{ currentVersion }}</span>
      <button @click="checkNow">Check Updates</button>
    </header>

    <div v-if="updateAvailable" class="update-banner">
      <p>Version {{ newVersion }} available!</p>
      <button @click="applyUpdate">Update Now</button>
    </div>
  </div>
</template>
```

### Vue 2/3 Options API

```vue
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
    window.AutoUpdate.init({
      manifestUrl: '/version-manifest.json',
      forceUpdate: false,
      showNotification: false,
      onUpdateAvailable: (newVer, oldVer) => {
        this.updateAvailable = true;
        this.currentVersion = oldVer;
        this.newVersion = newVer;
      }
    });
  },

  beforeUnmount() {
    window.AutoUpdate.destroy();
  }
};
</script>
```

See `examples/vue-integration.vue` for the complete implementation.

---

## Angular Integration

### Installation

```bash
# Add auto-update.js to your assets folder
cp auto-update.js src/assets/
cp version-manifest.json src/assets/
```

### Load the Script

In `src/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular App</title>
  <base href="/">
  <script src="assets/auto-update.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### Create the Service

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoUpdateService {
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  private currentVersion$ = new BehaviorSubject<string | null>(null);
  private newVersion$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.initAutoUpdate();
  }

  private initAutoUpdate(): void {
    (window as any).AutoUpdate.init({
      manifestUrl: '/assets/version-manifest.json',
      forceUpdate: false,
      showNotification: false,
      rolloutPercentage: 1.0,
      onUpdateAvailable: (newVer: string, oldVer: string) => {
        this.updateAvailable$.next(true);
        this.currentVersion$.next(oldVer);
        this.newVersion$.next(newVer);
      }
    });
  }

  getUpdateAvailable(): Observable<boolean> {
    return this.updateAvailable$.asObservable();
  }

  getCurrentVersion(): Observable<string | null> {
    return this.currentVersion$.asObservable();
  }

  applyUpdate(): void {
    (window as any).AutoUpdate.applyUpdate();
  }
}
```

### Use in Component

```typescript
import { Component, OnInit } from '@angular/core';
import { AutoUpdateService } from './services/auto-update.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <header>
        <h1>My App</h1>
        <span>Version: {{ currentVersion$ | async }}</span>
        <button (click)="checkUpdates()">Check Updates</button>
      </header>

      <div *ngIf="updateAvailable$ | async" class="update-banner">
        <p>New version available!</p>
        <button (click)="applyUpdate()">Update Now</button>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  updateAvailable$ = this.autoUpdate.getUpdateAvailable();
  currentVersion$ = this.autoUpdate.getCurrentVersion();

  constructor(private autoUpdate: AutoUpdateService) {}

  ngOnInit(): void {}

  applyUpdate(): void {
    this.autoUpdate.applyUpdate();
  }

  checkUpdates(): void {
    (window as any).AutoUpdate.checkNow();
  }
}
```

See `examples/angular-integration.ts` for the complete implementation.

---

## Progressive Rollout

Update only a percentage of users:

```javascript
// React
useAutoUpdate({
  manifestUrl: '/version-manifest.json',
  rolloutPercentage: 0.1  // 10% of users
});

// Vue
useAutoUpdate({
  manifestUrl: '/version-manifest.json',
  rolloutPercentage: 0.5  // 50% of users
});

// Angular
AutoUpdate.init({
  manifestUrl: '/version-manifest.json',
  rolloutPercentage: 0.25  // 25% of users
});
```

Each user gets a stable ID, so they consistently either get or don't get the update.

---

## TypeScript Support

All frameworks have full TypeScript support:

```typescript
import type { AutoUpdate } from 'auto-update';

const config: AutoUpdate.Config = {
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000,
  forceUpdate: false,
  rolloutPercentage: 1.0,
  onUpdateAvailable: (newVersion: string, oldVersion: string) => {
    console.log(`Update: ${oldVersion} → ${newVersion}`);
  }
};
```

---

## Testing

### React Testing Library

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('shows update notification', async () => {
  // Mock AutoUpdate
  window.AutoUpdate = {
    init: jest.fn(),
    checkNow: jest.fn(),
    applyUpdate: jest.fn(),
    getVersion: () => '1.0.0'
  };

  render(<App />);
  
  // Trigger update callback
  const callback = window.AutoUpdate.init.mock.calls[0][0].onUpdateAvailable;
  callback('1.0.1', '1.0.0');

  await waitFor(() => {
    expect(screen.getByText(/new version available/i)).toBeInTheDocument();
  });
});
```

### Vue Test Utils

```javascript
import { mount } from '@vue/test-utils';
import App from './App.vue';

test('shows update notification', async () => {
  window.AutoUpdate = {
    init: jest.fn(),
    destroy: jest.fn(),
    getVersion: () => '1.0.0'
  };

  const wrapper = mount(App);
  
  // Trigger update
  const callback = window.AutoUpdate.init.mock.calls[0][0].onUpdateAvailable;
  callback('1.0.1', '1.0.0');

  await wrapper.vm.$nextTick();
  
  expect(wrapper.text()).toContain('new version available');
});
```

### Angular Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { AutoUpdateService } from './auto-update.service';

describe('AutoUpdateService', () => {
  let service: AutoUpdateService;

  beforeEach(() => {
    (window as any).AutoUpdate = {
      init: jest.fn(),
      destroy: jest.fn()
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoUpdateService);
  });

  it('should initialize AutoUpdate', () => {
    expect((window as any).AutoUpdate.init).toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

**AutoUpdate is undefined**  
Make sure the script is loaded before your app initializes. Add it to `index.html`, not imported in JS.

**Updates not detected in development**  
Development servers often have their own hot reload. Test in production build.

**TypeScript errors**  
Make sure `auto-update.d.ts` is in your project and referenced in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  }
}
```

---

## Best Practices

1. **Don't force update during user actions** - Let them finish what they're doing
2. **Show clear notifications** - Tell users what's happening
3. **Test rollout percentages** - Start with 10%, then increase
4. **Handle errors gracefully** - Don't break the app if update fails
5. **Log update events** - Track adoption in analytics

---

## Examples

All complete examples are in the `examples/` folder:
- `react-integration.jsx`
- `vue-integration.vue`
- `angular-integration.ts`

Copy and adapt them for your project.
