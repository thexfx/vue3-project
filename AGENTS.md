# Agent Guidelines for vue3-project

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start Vite dev server with hot reload

# Build
npm run build            # Full build (type-check + build-only)
npm run build-only       # Build without type checking
npm run type-check       # Run vue-tsc type checking

# Preview
npm run preview          # Preview production build

# Linting
npm run lint             # Run all linters (oxlint + eslint sequentially)
npm run lint:oxlint      # Run oxlint with auto-fix (fast correctness checks)
npm run lint:eslint      # Run eslint with auto-fix and cache (Vue-specific rules)
```

**Note:** No test runner is currently configured. To add tests, consider Vitest or Playwright.

## Code Style Guidelines

### TypeScript & Vue
- Use TypeScript with `<script setup lang="ts">` in Vue SFCs
- Enable `noUncheckedIndexedAccess` for extra type safety (may cause false positives)
- Use Composition API with `<script setup>` syntax
- Follow Vue 3 style guide: https://vuejs.org/style-guide/
- TypeScript strict mode is enabled for compile-time safety

### Imports
- Use `@/` path alias for src/ directory imports (configured in tsconfig and vite.config)
- Group imports in order: 1) Vue/core libs, 2) third-party, 3) local
- Use `import type` for type-only imports to improve performance

```typescript
// Correct import order
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
```

### Formatting
- **Indent:** 2 spaces (enforced by EditorConfig)
- **Line endings:** LF (Unix-style)
- **Max line length:** 100 characters
- **Charset:** UTF-8
- Always insert final newline, trim trailing whitespace
- Use EditorConfig (`.editorconfig`) for consistent editor settings

### Naming Conventions
- Components: PascalCase (e.g., `HelloWorld.vue`, `TheWelcome.vue`)
- Composables: camelCase starting with "use" (e.g., `useCounterStore`)
- Stores: camelCase ending with "Store" (e.g., `useCounterStore`)
- Files: PascalCase for components/views, camelCase for utilities/stores

### Project Structure
```
src/
  components/     # Reusable Vue components (UI building blocks)
  views/          # Page-level components (route views)
  stores/         # Pinia stores (Composition API style)
  router/         # Vue Router configuration
  assets/         # Static assets and global styles
```

### ESLint & Oxlint Configuration
- Dual linting system: ESLint + Oxlint
- Oxlint runs first for fast correctness checks (categories.correctness=error)
- ESLint handles Vue-specific rules and Vue 3 recommended config
- Configuration files:
  - `eslint.config.ts` - ESLint flat config
  - `.oxlintrc.json` - Oxlint configuration
- Plugins enabled: eslint, typescript, unicorn, oxc, vue

### State Management
- Use Pinia with Composition API syntax (arrow function style)
- Define stores with arrow functions returning reactive state
- Access stores in components using the composable pattern

```typescript
// Example store pattern
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

### Error Handling
- Use TypeScript strict mode for compile-time safety
- Handle async errors properly in composables/stores
- Use Vue's errorHandler for runtime errors (configure in main.ts)
- Prefer try-catch for async operations with user feedback

### TypeScript Configuration
- Uses `@vue/tsconfig/tsconfig.dom.json` as base
- Path mapping: `@/*` maps to `./src/*`
- Incremental type-checking enabled with `.tsbuildinfo` in node_modules/.tmp
- Files: `env.d.ts`, `src/**/*`, `src/**/*.vue`
- Excludes: `src/**/__tests__/*`

### Vite Configuration
- Uses `@vitejs/plugin-vue` for Vue SFC support
- Includes `vite-plugin-vue-devtools` for development debugging
- Path alias `@` configured to resolve to `./src`

### Node & Package Requirements
- Node.js: `^20.19.0 || >=22.12.0`
- Package manager: npm
- Dependencies: vue, vue-router, pinia
- DevDependencies: vite, typescript, vue-tsc, eslint, oxlint

### Editor Setup
- VS Code recommended (settings in `.vscode/`)
- Recommended extensions listed in `.vscode/extensions.json`
- Use ESLint and Oxlint VS Code extensions for inline linting

---
*Generated for Vue 3 + Vite + TypeScript + Pinia project*