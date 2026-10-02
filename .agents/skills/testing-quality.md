---
description: Testing strategies and code quality tools
---

# Testing & Code Quality

## Testing Framework
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Storybook** - Component testing and documentation
- **TypeScript** - Static type checking

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "import/no-cycle": "error",
    "react-hooks/rules-of-hooks": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Linting Scripts
```bash
npm run lint              # Full codebase linting
npm run typecheck         # TypeScript validation
npm run lint:architecture # Import restriction checks
```

## Architecture Testing
- **Dependency cruiser** - Circular dependency detection
- **Import restrictions** - Layered architecture enforcement
- **Custom architecture tests** - Business rule validation

### Architecture Commands
```bash
npm run check:dependencies  # Detect circular dependencies
npm run analyze:imports      # Visualize import graph
npm run test:architecture   # Run architecture tests
```

## Testing Strategies

### Unit Testing
- **Component testing** with React Testing Library
- **Hook testing** for custom hooks
- **Service testing** for API services
- **Store testing** for state management

### Integration Testing
- **API integration** testing
- **Component integration** testing
- **State flow** testing
- **User journey** testing

### E2E Testing
- **Critical user flows** with Playwright
- **Cross-browser testing**
- **Mobile responsiveness** testing
- **Performance testing**

## Quality Gates

### Pre-commit Hooks (Husky)
```bash
# .husky/pre-commit
npm run lint && npm run typecheck && npm run format
```

### CI/CD Pipeline
- **Automated testing** on pull requests
- **Code coverage** reporting
- **Bundle analysis** for performance
- **Security scanning** for vulnerabilities

## Performance Monitoring
- **Bundle analyzer** for optimization
- **Lighthouse CI** for performance scores
- **Sentry** for error monitoring
- **Core Web Vitals** tracking

## Documentation
- **Storybook** for component documentation
- **JSDoc comments** for API documentation
- **README files** for complex features
- **Architecture decision records**
