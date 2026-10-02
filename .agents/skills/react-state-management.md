---
description: React state management using Zustand and custom hooks
---

# React State Management

## Core Technologies
- **Zustand** - Primary state management library
- **React Query (TanStack Query)** - Server state management
- **Custom Hooks** - Business logic abstraction
- **Context API** - Global configuration and theme

## Store Architecture

### Zustand Stores (35+ stores)
- `useAuthStore` - Authentication state
- `useCartStore` - Shopping cart management
- `useSearchModalStore` - Search interface state
- `useAdvancedSearchStore` - Advanced search filters
- `useMmeStore` - Make Model Engine data
- `useNewSearchModalStore` - Enhanced search functionality
- `useSavedCarsStore` - User vehicle garage
- `useFilter` - Product filtering logic

### Key Patterns
```typescript
// Store creation with TypeScript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  // ...
}));
```

## Server State Management
- **React Query** for API caching and synchronization
- **Persistent queries** with localStorage sync
- **Background refetching** and stale-while-revalidate
- **Optimistic updates** for better UX

## State Persistence
- **Query persistence** with `@tanstack/react-query-persist-client`
- **Local storage** for user preferences
- **Session storage** for temporary state
- **Cookie-based** authentication tokens

## Best Practices
- **Circular dependency prevention** with lazy imports
- **TypeScript interfaces** for all store types
- **Middleware** for logging and debugging
- **Selectors** for derived state
- **Actions** for state mutations
