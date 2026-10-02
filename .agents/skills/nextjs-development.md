---
description: Next.js development skills for OttoGusto e-commerce platform
---

# Next.js Development

## Core Competencies
- **Next.js 14** with App Router architecture
- **Server Components** and Client Components patterns
- **Middleware** for routing and authentication
- **Static Site Generation (SSG)** and Server-Side Rendering (SSR)
- **API Routes** and server-side logic
- **Internationalization (i18n)** with multi-language support
- **Performance optimization** with caching strategies

## Key Files & Patterns
- `app/layout.tsx` - Root layout with theme providers
- `app/` - App Router pages and API routes
- `middleware.ts` - Request routing and store detection
- `next.config.js` - Build configuration and optimizations

## Development Commands
```bash
# Development
npm run dev          # Start development server
npm run local        # Local development with .env.local

# Building
npm run build        # Production build
npm run start_live   # Run production build locally

# Code Quality
npm run lint         # ESLint across all directories
npm run typecheck    # TypeScript validation
npm run format       # Prettier formatting

# Testing
npm run test:architecture  # Architecture compliance tests
```

## Architecture Patterns
- **Multi-store support** (Ottogusto, Qverde)
- **Theme system** with dynamic color/typography mapping
- **Error boundaries** and fallback components
- **Suspense** for loading states
- **Provider pattern** for state management

## Performance Features
- **Font optimization** with Google Fonts preload
- **Image optimization** with Next.js Image component
- **Bundle analysis** with dependency cruiser
- **Caching strategies** for static assets
- **Lazy loading** for components and routes
