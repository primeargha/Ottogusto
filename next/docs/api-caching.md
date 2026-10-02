# API Caching System Documentation

## Overview

This document describes the enhanced API caching system implemented for the Otto Gusto Next.js v14 application. The system provides intelligent request deduplication, response caching, adaptive memory management, and comprehensive telemetry.

## Features

### 🚀 Request Deduplication

- Prevents multiple identical API calls from being made simultaneously
- Shares a single promise among all duplicate requests
- Automatic timeout handling for pending requests

### 💾 Response Caching

- Intelligent caching only for GET requests
- Adaptive TTL (Time To Live) based on endpoint type and memory pressure
- Memory-efficient storage with compression for large entries

### 🧠 Smart Cache Invalidation

- Automatic invalidation on POST/PUT/DELETE requests
- Pattern-based cache clearing
- Related cache cleanup (parent/child relationships)

### 📊 Enhanced Telemetry

- Cache hit/miss metrics
- Memory usage tracking
- Performance monitoring
- Detailed error tracking

### 🔧 Cache Management Utilities

- Programmatic cache control
- Statistics and monitoring
- Manual refresh and invalidation

## Configuration

### Cache Configuration

```typescript
const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes default TTL
  maxCacheSize: 100, // Maximum cached entries
  cleanupInterval: 60 * 1000, // Cleanup interval (1 minute)
  pendingRequestTimeout: 30 * 1000, // Pending request timeout (30 seconds)
  memoryThreshold: 50 * 1024 * 1024, // Memory threshold (50MB)
  adaptiveTTL: true, // Enable adaptive TTL
  compressionThreshold: 1024, // Compress entries > 1KB
};
```

### Endpoint-Specific TTL

| Endpoint Pattern  | Base TTL   | Description            |
| ----------------- | ---------- | ---------------------- |
| `/Translations/*` | 1 hour     | Translation data       |
| `/config/*`       | 30 minutes | Configuration data     |
| `/brands/*`       | 15 minutes | Brand data             |
| Default           | 5 minutes  | All other GET requests |

### Adaptive TTL

The system automatically adjusts TTL based on memory pressure:

- **Normal (< 70% memory)**: Full TTL
- **Moderate (70-80%)**: 60% of base TTL
- **High (80-90%)**: 30% of base TTL (min 1 minute)
- **Critical (> 90%)**: 10% of base TTL (min 30 seconds)

## Usage

### Basic API Calls

```typescript
import { apiClient } from "@/config/api";

// GET request (automatically cached)
const users = await apiClient.get<User[]>("/api/users");

// POST request (invalidates related cache)
const newUser = await apiClient.post<User>("/api/users", userData);

// PUT request (invalidates related cache)
const updatedUser = await apiClient.put<User>("/api/users/123", updateData);

// DELETE request (invalidates related cache)
await apiClient.delete("/api/users/123");
```

### Cache Management

```typescript
import { cacheUtils } from "@/config/api";

// Clear all cache
cacheUtils.clear();

// Clear cache for specific pattern
cacheUtils.clearPattern("/translations");

// Smart invalidation (invalidates related entries)
const invalidatedCount = cacheUtils.invalidateRelated("/api/users/123", "PUT");

// Get cache statistics
const stats = cacheUtils.getStats();
console.log(`Cache size: ${stats.cacheSize}`);
console.log(`Pending requests: ${stats.pendingRequests}`);

// Force refresh specific cache entry
const freshData = await cacheUtils.refresh("/api/users");

// Check if cache entry exists and is valid
const hasValid = cacheUtils.hasValid("/api/users");

// Get cached data without making request
const cachedData = cacheUtils.get<User[]>("/api/users");
```

### Preloading Cache

```typescript
// Preload frequently accessed data
await cacheUtils.preload("/api/translations/en");
await cacheUtils.preload("/api/config");
```

## Cache Key Generation

Cache keys are generated based on:

- URL
- Query parameters
- Request body (for non-GET requests)

Format: `{url}:{params}:{data}`

Example:

```
/api/users?page=1&limit=10:{"page":1,"limit":10}:
```

## Memory Management

### Automatic Cleanup

The system performs automatic cleanup every 60 seconds:

1. **Expired Entries**: Removes entries past their TTL
2. **Memory Pressure**: Aggressively removes oldest 25% when memory > 85%
3. **Size Limits**: Enforces maximum cache size with LRU eviction
4. **Pending Requests**: Cleans up timed-out pending requests

### Memory Monitoring

```typescript
// Get current memory usage
const memory = {
  used: process.memoryUsage().heapUsed,
  total: process.memoryUsage().heapTotal,
  ratio: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
};
```

### Compression

Large cache entries (> 1KB) are automatically compressed to reduce memory usage.

## Telemetry Events

### Cache Events

| Event                         | Description         | Payload                                                 |
| ----------------------------- | ------------------- | ------------------------------------------------------- |
| `api_cache_hit`               | Cache hit occurred  | cacheKey, responsePayload                               |
| `api_cache_invalidated`       | Manual invalidation | pattern, invalidatedCount                               |
| `api_cache_smart_invalidated` | Smart invalidation  | url, method, invalidatedCount                           |
| `api_cache_cleanup`           | Automatic cleanup   | deletedEntries, expiredRequests, cacheSize, memoryUsage |

### API Events

| Event         | Description         | Enhanced Fields                                |
| ------------- | ------------------- | ---------------------------------------------- |
| `api_success` | Successful API call | cacheHit, cacheKey, pendingRequests, cacheSize |
| `api_error`   | API call failed     | cacheKey, pendingRequests, cacheSize           |

## Best Practices

### DO ✅

1. **Use cacheUtils for manual control** when you need to invalidate specific data
2. **Monitor cache stats** in development to understand usage patterns
3. **Preload critical data** during application startup
4. **Use appropriate TTL patterns** for different data types
5. **Monitor memory usage** in production

### DON'T ❌

1. **Don't cache sensitive data** - auth endpoints are automatically excluded
2. **Don't rely on cache for real-time data** - use appropriate TTL
3. **Don't clear entire cache frequently** - use pattern-based clearing
4. **Don't ignore memory warnings** - the system will auto-cleanup under pressure

## Troubleshooting

### Common Issues

#### Cache Not Working

```typescript
// Check if endpoint should be cached
const shouldCache = (method: string, url: string) => {
  // Only GET requests are cached
  if (method.toUpperCase() !== "GET") return false;

  // Auth endpoints are excluded
  const noCachePatterns = ["/auth/", "/login", "/logout", "/refresh"];
  return !noCachePatterns.some((pattern) => url.includes(pattern));
};
```

#### High Memory Usage

```typescript
// Check cache statistics
const stats = cacheUtils.getStats();
console.log("Cache entries:", stats.cacheEntries.length);

// Force cleanup if needed
cacheUtils.clear();
```

#### Stale Data

```typescript
// Force refresh specific data
const freshData = await cacheUtils.refresh("/api/stale-data");

// Or invalidate related cache
cacheUtils.invalidateRelated("/api/stale-data", "POST");
```

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=api-cache npm run dev
```

## Performance Impact

### Metrics to Monitor

1. **Cache Hit Rate**: Percentage of requests served from cache
2. **Memory Usage**: Total memory consumed by cache
3. **Request Deduplication**: Number of duplicate requests prevented
4. **Cleanup Frequency**: How often automatic cleanup runs

### Expected Improvements

- **50-80% reduction** in API calls for cached endpoints
- **10-50ms faster response** times for cache hits
- **Reduced server load** from request deduplication
- **Better user experience** with faster page loads

## Integration Examples

### React Query Integration

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient, cacheUtils } from "@/config/api";

function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get<User[]>("/api/users"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Manual invalidation
function invalidateUsers() {
  cacheUtils.invalidateRelated("/api/users", "POST");
}
```

### Server Component Integration

```typescript
import { cacheUtils } from "@/config/api";

async function Page() {
  // Preload critical data
  await cacheUtils.preload("/api/translations/en");
  await cacheUtils.preload("/api/config");

  // ... rest of component
}
```

## Migration Guide

### From Basic API Client

1. **Replace imports**:

   ```typescript
   // Before
   import { apiClient } from "@/config/api";

   // After (no change needed)
   import { apiClient, cacheUtils } from "@/config/api";
   ```

2. **Add cache utilities** (optional):

   ```typescript
   import { cacheUtils } from "@/config/api";
   ```

3. **Monitor performance** using the enhanced telemetry

### Breaking Changes

- None - the implementation is fully backward compatible
- Existing code continues to work without changes
- New features are opt-in via cacheUtils

## Security Considerations

### Data Privacy

- Authentication endpoints (`/auth/*`, `/login`, `/logout`, `/refresh`) are automatically excluded from caching
- Sensitive data should have appropriate TTL settings
- Cache data is stored in memory only (not persisted)

### Cache Poisoning Prevention

- Cache keys include all request parameters
- Response validation ensures data integrity
- Automatic cleanup prevents accumulation of invalid data

## Future Enhancements

### Planned Features

1. **Persistent Cache**: Redis integration for distributed caching
2. **Cache Warming**: Automatic preloading of frequently accessed data
3. **Advanced Compression**: Better compression algorithms for large data
4. **Cache Analytics**: Dashboard for cache performance monitoring
5. **Selective Caching**: More granular control over what gets cached

### Contributing

When modifying the caching system:

1. **Test memory usage** under various conditions
2. **Verify cache invalidation** works correctly
3. **Update telemetry** for new events
4. **Document new configuration options**
5. **Add unit tests** for new functionality

---

## Support

For questions or issues with the caching system:

1. Check the troubleshooting section above
2. Review the telemetry events for debugging
3. Monitor cache statistics for performance issues
4. Contact the development team for complex issues

Last updated: January 2026
