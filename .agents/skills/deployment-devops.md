---
description: Deployment strategies and DevOps practices
---

# Deployment & DevOps

## Deployment Architecture
- **Azure Static Web Apps** - Primary hosting platform
- **Docker containerization** - Consistent environments
- **Multi-environment** support (dev, staging, production)
- **CDN integration** for static assets

## Environment Configuration

### Environment Files
- `.env.main` - Development environment
- `.env.master` - Production environment
- `.env.ottogusto.local` - Local Ottogusto development
- `.env.qverde.local` - Local Qverde development

### Store-Specific Deployment
```bash
# Ottogusto deployment
STORE=ottogusto npm run build

# Qverde deployment
STORE=qverde npm run build
```

## Docker Configuration
- **Multi-stage builds** for optimization
- **Nginx reverse proxy** for routing
- **Docker Compose** for local development
- **Container orchestration** support

### Docker Commands
```bash
# Local development
docker compose up --build -d

# Production build
docker build -t ottogusto:latest .
```

## CI/CD Pipeline
- **Azure DevOps** integration
- **Automated testing** on pull requests
- **Environment-specific** deployments
- **Rollback capabilities**

### Build Process
```bash
# Production build pipeline
npm ci                    # Install dependencies
npm run lint             # Code quality checks
npm run typecheck        # TypeScript validation
npm run build            # Build application
npm run start_live       # Test production build
```

## Performance Optimization
- **Static asset optimization** with Next.js
- **Image compression** and WebP support
- **Bundle splitting** for faster loads
- **CDN caching** strategies

## Monitoring & Observability
- **Sentry** for error tracking
- **Azure Monitor** for performance
- **Application Insights** for user behavior
- **Log aggregation** for debugging

## Security Practices
- **Environment variable** management
- **HTTPS enforcement** across all environments
- **CORS configuration** for API security
- **Content Security Policy** (CSP) headers
- **Dependency scanning** for vulnerabilities

## Multi-Store Deployment
- **Separate deployments** for Ottogusto and Qverde
- **Shared codebase** with environment-specific configs
- **DNS routing** for store-specific domains
- **Feature flags** for store-specific features
