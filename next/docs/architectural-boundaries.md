# Architectural Boundaries & Dependency Rules

## Overview

This document defines the architectural boundaries and dependency rules for the Next.js application to ensure maintainable, scalable, and well-organized code structure.

## Current Status

`npm run analyze:imports` → **✔ no dependency violations found** (901 modules, 3816 dependencies)

`npm run dpc` → generates `dependencygraph.svg` in <5 seconds (architecture overview)

---

## Known Architectural Patterns

### Circular Dependency Suppression

The following modules form intentional runtime-safe circular references, broken via lazy `require()` or dynamic `import()` accessors. They are excluded from the `no-circular` depcruise rule:

| Module                              | Lazy accessor targets                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `stores/useAuthStore.ts`            | `stores/useCartStore` (via `require()`)                                            |
| `stores/useCartStore.ts`            | `stores/useMmeStore` (via `require()`)                                             |
| `stores/useMmeStore.ts`             | `stores/useCategorySearchStore`, `helpers/UtilityHelper` (via `require()`)         |
| `stores/useCategorySearchStore.ts`  | `helpers/UtilityHelper` functions (via `require()`)                                |
| `stores/useAdvancedSearchStore.ts`  | `stores/useSearchModalStore` (via `require()`)                                     |
| `stores/useSearchModalStore.ts`     | `stores/useAdvancedSearchStore`, `stores/useCategorySearchStore` (via `require()`) |
| `helpers/UtilityHelper.ts`          | `services/advancedSearchService` (via dynamic `import()`)                          |
| `services/search.ts`                | Uses `config/api` (static) — cycle broken upstream                                 |
| `services/advancedSearchService.ts` | Uses `config/api` (static) — cycle broken upstream                                 |
| `config/api.ts`                     | Uses `stores/useAuthStore` (static) — cycle broken upstream                        |

**Pattern used:**

```ts
// Static import (creates module-load cycle) — DO NOT USE between these modules
import { useCartStore } from "./useCartStore";

// Lazy require() accessor (resolved at call time, no static cycle) — USE THIS
const getCartStore = () => require("./useCartStore").useCartStore;
// Usage: getCartStore().getState().someProperty
```

## Proposed Architecture

### Layer Structure

```
app/           → Presentation Layer (Routes, Pages)
├── (public)/  → Public Routes
├── (protected)/ → Protected Routes
└── api/       → API Routes (Server-side)

screens/       → Feature Screens (Complex UI Components)
components/    → Reusable UI Components
├── ui/        → Base UI Components
├── og-components/ → Domain Components
└── forms/     → Form Components

stores/        → State Management Layer
hooks/         → Custom Hooks (Business Logic)
services/      → Data Access Layer
lib/           → Utilities and Core Logic
utils/         → Helper Functions
types/         → Type Definitions
config/        → Configuration
constants/     → Application Constants
```

### Layer Responsibilities

#### **app/** - Presentation Layer

- Route definitions and page components
- Layout components
- Server-side API routes
- **Should**: Import from screens, components, hooks, stores, services
- **Should not**: Be imported by other layers

#### **screens/** - Feature Screens

- Complex UI components combining multiple features
- Page-specific business logic
- Feature orchestration
- **Should**: Import from components, hooks, stores, services
- **Should not**: Import from app layer

#### **components/** - Reusable UI Components

- Presentational components
- UI logic only
- **Should**: Import from hooks, stores, utils, types
- **Should not**: Import from app, screens, services

#### **hooks/** - Business Logic

- Custom React hooks
- Business logic encapsulation
- Data transformation
- **Should**: Import from services, utils, types
- **Should not**: Import from UI layers

#### **services/** - Data Access Layer

- API calls
- Data fetching and caching
- External service integrations
- **Should**: Import from utils, types, config
- **Should not**: Import from UI layers or stores

#### **stores/** - State Management

- Global state management
- State composition
- **Should**: Import from hooks, services, utils, types
- **Should not**: Import from UI layers

## Dependency Rules

### Allowed Dependencies

```
app → screens → components → hooks → services → lib/utils
app → stores → hooks → services
app → config → constants
screens → stores → hooks → services
components → stores → hooks → utils
hooks → services → utils → types
services → utils → types → config
```

### Forbidden Dependencies

```
components → app (circular)
services → app/screens/components (business logic isolation)
utils → stores/hooks (pure functions)
types → anything (type definitions only)
```

## Implementation

### 1. ESLint Configuration

Update `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "plugin:storybook/recommended"],
  "rules": {
    "react/display-name": "off",
    "import/no-cycle": "error",
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./app",
            "from": "./screens",
            "message": "App routes should not import from screens"
          },
          {
            "target": "./screens",
            "from": "./components",
            "message": "Screens should not import from components (use @/components)"
          },
          {
            "target": "./components",
            "from": "./screens",
            "message": "Components should not import from screens"
          },
          {
            "target": "./hooks",
            "from": "./app",
            "message": "Hooks should not import from app layer"
          },
          {
            "target": "./services",
            "from": "./app",
            "message": "Services should not import from app layer"
          }
        ]
      }
    ],
    "import/no-relative-parent-imports": "error"
  }
}
```

### 2. TypeScript Path Mapping

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/app/*": ["./app/*"],
      "@/screens/*": ["./screens/*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/services/*": ["./services/*"],
      "@/stores/*": ["./stores/*"],
      "@/utils/*": ["./utils/*"],
      "@/types/*": ["./types/*"],
      "@/config/*": ["./config/*"],
      "@/constants/*": ["./constants/*"],
      "@/assets/*": ["./public/assets/*"]
    }
  }
}
```

### 3. Package.json Scripts

Current scripts in `package.json`:

```json
{
  "scripts": {
    "lint:architecture": "eslint . --ext .ts,.tsx --rule 'import/no-restricted-paths: error'",
    "check:dependencies": "madge --circular ./",
    "analyze:imports": "depcruise --validate .dependency-cruiser.js .",
    "dpc": "depcruise --exclude \"^node_modules\" --output-type dot --collapse \"^(app|components|screens|services|stores|hooks|helpers)/[^/]+\" app components screens services stores hooks helpers | dot -T svg > dependencygraph.svg",
    "test:architecture": "vitest run tests/architecture/"
  }
}
```

> **Note on `dpc`:** The `--collapse` flag folds each top-level folder's contents into single nodes before rendering. This keeps the output graph small enough for `dot` to render quickly (~50 nodes vs 4000+ raw). Do **not** replace `dot` with `sfdp` here — `sfdp` hangs on graphs of this size.

### 4. Dependency Cruiser Configuration

The live config is at `.dependency-cruiser.js`. Key rules:

**`no-circular`** — warns on circular imports. Excludes the following from the `from` path to suppress known intentional lazy-broken cycles:

```
stores/useAuthStore, stores/useCartStore, stores/useMmeStore,
stores/useCategorySearchStore, stores/useAdvancedSearchStore,
stores/useSearchModalStore, helpers/UtilityHelper,
services/search, services/advancedSearchService, config/api
```

**`no-orphans`** — warns on unused modules. Excludes (by `pathNot`):

- Dot files, `.d.ts`, `tsconfig.json`, babel/webpack configs
- `app/**/page.tsx`, `app/**/route.ts`, `app/global-error.tsx`, `app/**/layout.tsx` — Next.js entry points
- `instrumentation(-client).ts` — Next.js instrumentation
- `next.config.js`, `postcss.config.js`, `tailwind.config.*`, `copyassets.js`, `vitest.config.*`
- `server/server*` — standalone server entry points
- `index.web.tsx` — React Native platform-specific variants
- `components/ui/` — Gluestack UI platform stubs
- `components/RouteChangeHandler.tsx`, `components/icons/`, `components/examples/`
- `data/previousSearch/`
- `screens/landing/index.tsx`, `screens/auth/create-password/assets/icons/google/index.tsx`, `hooks/returns.ts`

**`no-deprecated-core`**, **`not-to-dev-dep`**, **`ui-to-api-direct-access`** — see `.dependency-cruiser.js` for full details.

### 5. Architectural Tests

Create `tests/architecture/boundaries.test.ts`:

```typescript
import { execSync } from "child_process";

describe("Archural Boundaries", () => {
  test("no app imports from screens", () => {
    try {
      const result = execSync('grep -r "from.*screens/" app/', { encoding: "utf8" });
      fail(`Found app importing from screens:\n${result}`);
    } catch (error) {
      // No matches found - test passes
    }
  });

  test("no relative parent imports beyond 1 level", () => {
    try {
      const result = execSync(
        'grep -r "\\.\\.\\./\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules',
        { encoding: "utf8" },
      );
      fail(`Found deep relative imports:\n${result}`);
    } catch (error) {
      // No matches found - test passes
    }
  });

  test("all imports use path aliases", () => {
    try {
      const result = execSync(
        'grep -r "\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next',
        { encoding: "utf8" },
      );
      fail(`Found relative imports:\n${result}`);
    } catch (error) {
      // No matches found - test passes
    }
  });
});
```

## Completed Migration

### Phase 1 — Tooling ✅

- `dependency-cruiser` v17 configured at `.dependency-cruiser.js`
- `madge` available via `npm run check:dependencies`
- Scripts: `analyze:imports`, `dpc`, `lint:architecture`

### Phase 2 — Circular Dependency Fixes ✅

- All circular import chains broken via lazy `require()` / dynamic `import()` (Feb 2026)
- `data/branding/types.ts` extracted to hold `LablesInterface`, breaking the `faqs.ts ↔ labels.ts` and `browse-by-category.ts ↔ labels.ts` cycles
- `types/categories.ts` extracted to hold `PartsCategoryInterface`
- Unused stores `useProfileStore.ts` and `useCheckoutStore.ts` deleted
- See **LINT_FIXES_REPORT.md** for the full per-file change table

### Phase 3 — Enforcement ✅

- `.husky/pre-commit` runs `npm run lint && npm run typecheck && npm run format`
- `analyze:imports` can be added to CI pipeline: `npm run analyze:imports`

### Remaining Work

- ~968 pre-existing TypeScript errors (see `npm run typecheck`) — separate effort
- `hooks/returns.ts`, `screens/landing/index.tsx` — genuinely orphaned, consider removing if never wired up

## Code Examples

### Before (Violates Boundaries)

```typescript
// screens/products/products.tsx
import gridwhite from "../../public/assets/gridview.svg"; // ❌ Relative import
import { SomeComponent } from "../components/SomeComponent"; // ❌ Should use @/components
```

### After (Follows Rules)

```typescript
// screens/products/products.tsx
import gridwhite from "@/assets/gridview.svg"; // ✅ Path alias
import { SomeComponent } from "@/components/SomeComponent"; // ✅ Proper import
```

## Best Practices

### Import Organization

1. **Group imports** by type (React, third-party, internal)
2. **Use path aliases** consistently
3. **Avoid relative imports** beyond one level
4. **Import types separately** using `import type`

### Component Structure

1. **Keep components pure** - no direct API calls
2. **Use hooks for business logic**
3. **Separate UI from business logic**
4. **Prefer composition over inheritance**

### Service Layer

1. **Abstract API calls** behind service functions
2. **Handle errors consistently**
3. **Use proper TypeScript types**
4. **Implement caching strategies**

## Monitoring & Enforcement

### CI/CD Pipeline

```yaml
# .github/workflows/architecture.yml
name: Architecture Checks
on: [push, pull_request]
jobs:
  architecture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint:architecture
      - run: npm run test:architecture
      - run: npm run check:dependencies
```

### Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "npm run lint:architecture"]
  }
}
```

## Troubleshooting

### Common Issues

1. **Circular Dependencies**
   - Use `madge --circular src/` to detect
   - Refactor shared code into separate modules
   - Use dependency injection

2. **Deep Relative Imports**
   - Configure TypeScript paths properly
   - Update all references consistently
   - Use IDE auto-import features

3. **ESLint Rule Conflicts**
   - Adjust rule severity as needed
   - Document exceptions
   - Use `// eslint-disable-next-line` sparingly

## Resources

- [ESLint Import Rules](https://github.com/import-js/eslint-plugin-import)
- [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser)
- [Madge](https://github.com/pahen/madge)
- [Next.js Architecture](https://nextjs.org/docs/basic-features/data-fetching/overview)

## Conclusion

Implementing these architectural boundaries will:

- Improve code maintainability
- Reduce coupling between modules
- Make refactoring safer
- Enhance team collaboration
- Ensure consistent code organization

Regular reviews and updates to these rules will help maintain code quality as the application evolves.
