# API Caching Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Basic Usage

```typescript
import { apiClient, cacheUtils } from "@/config/api";

// Your existing API calls work automatically
const users = await apiClient.get<User[]>("/api/users");
const user = await apiClient.get<User>("/api/users/123");
```

### 2. Monitor Cache Performance

```typescript
// Check cache statistics
const stats = cacheUtils.getStats();
console.log(`Cache hit rate: ${stats.cacheSize} entries cached`);
console.log(`Pending requests: ${stats.pendingRequests}`);
```

### 3. Manual Cache Control

```typescript
// Clear specific cache
cacheUtils.clearPattern("/users");

// Force refresh data
const freshData = await cacheUtils.refresh("/api/users");

// Preload important data
await cacheUtils.preload("/api/translations/en");
```

## 🎯 Common Scenarios

### User Profile Updates

```typescript
// Update user profile (automatically invalidates cache)
const updated = await apiClient.put("/api/users/123", profileData);

// Force refresh related data
await cacheUtils.refresh("/api/users");
```

### Translation Management

```typescript
// Translations are cached for 1 hour automatically
const translations = await apiClient.get("/api/translations/en");

// Clear all translation cache when updating
cacheUtils.clearPattern("/translations");
```

### Real-time Data

```typescript
// Don't rely on cache for real-time data
const liveData = await apiClient.get("/api/live-updates");

// Or use very short TTL by invalidating immediately
cacheUtils.invalidateRelated("/api/live-updates", "GET");
```

## 📊 Performance Monitoring

The enhanced telemetry automatically tracks:

- ✅ Cache hit/miss rates
- ✅ Memory usage
- ✅ Request deduplication
- ✅ Cache invalidation events

Check your telemetry dashboard for these metrics!

## 🔧 Need More Control?

See the [full documentation](./api-caching.md) for advanced features like:

- Adaptive TTL configuration
- Memory pressure handling
- Custom cache invalidation strategies
- Performance optimization tips

---

**That's it! Your API calls are now automatically cached and optimized.** 🎉
