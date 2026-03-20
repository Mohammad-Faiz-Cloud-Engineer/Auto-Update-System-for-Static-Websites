# TypeScript Definitions

Type definitions for TypeScript projects.

## Usage

```typescript
import type { AutoUpdate } from 'auto-update';

const config: AutoUpdate.Config = {
  manifestUrl: '/version-manifest.json',
  checkInterval: 30000
};
```

Copy `auto-update.d.ts` to your project's types folder.
