---
description: API integration patterns and services architecture
---

# API Integration

## Service Architecture
- **Axios** - HTTP client with interceptors
- **React Query** - Server state management
- **Custom services** - Business logic abstraction
- **Error handling** - Centralized error management

## Core Services (18+ services)

### Authentication & User Management
- `authService.ts` - Login, logout, token management
- `profile.ts` - User profile operations
- `garageService.ts` - Vehicle garage management

### E-commerce Operations
- `cart.ts` - Shopping cart operations
- `products.ts` - Product catalog
- `productdetailsservice.ts` - Product details
- `orderStore.ts` - Order management

### Search & Discovery
- `search.ts` - Product search functionality
- `advancedSearchService.ts` - Advanced filtering
- `landingPageDataService.ts` - Homepage data

### Support & Utilities
- `support.ts` - Customer support
- `returnService.ts` - Product returns
- `address.ts` - Address management
- `fitmentService.ts` - Vehicle fitment data

## API Patterns

### Service Structure
```typescript
// Service example with error handling
export const productService = {
  async getProducts(params: ProductParams): Promise<Product[]> {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
```

### React Query Integration
```typescript
// Hook for data fetching
export const useProducts = (params: ProductParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Error Handling
- **Global error interceptors** in Axios
- **Retry logic** for failed requests
- **User-friendly error messages**
- **Sentry integration** for error tracking
- **Fallback data** for critical failures

## Performance Optimizations
- **Request deduplication** with React Query
- **Background refetching** for fresh data
- **Pagination** for large datasets
- **Caching strategies** for frequently accessed data
- **Request cancellation** for component unmounts

## Security Features
- **JWT token management**
- **Request/response interceptors**
- **CSRF protection**
- **API key management**
- **Environment-based configuration**
