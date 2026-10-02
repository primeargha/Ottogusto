# API Telemetry System

This project includes a comprehensive API-based telemetry system built with Next.js 14 and local SQLite database.

## Architecture

- **Database**: Local SQLite using `better-sqlite3`
- **Storage**: `/data/app.db` with WAL mode enabled
- **Collection**: Automatic via axios interceptors using HTTP API
- **Dashboard**: Web interface at `/telemetry`

## Components

### Database Schema

- `telemetry` table stores all API requests/responses
- Indexed by timestamp, event type, and URL for fast queries
- Includes request/response payloads, error details, and timing data

### API Routes

- `POST /api/telemetry` - Store telemetry data
- `GET /api/telemetry` - Retrieve telemetry with optional filtering
- `GET /api/telemetry/stats` - Get aggregated statistics

### Dashboard

- Real-time view of API calls
- Filter by event type (success/error/startup)
- Performance metrics and error tracking
- Accessible at `/en-BE/telemetry`

## Configuration

### Environment Variables

```bash
# Enable telemetry in production
NEXT_PUBLIC_ENABLE_TELEMETRY=true

# Custom telemetry endpoint (optional)
NEXT_PUBLIC_TELEMETRY_ENDPOINT=/api/telemetry
```

### Database Location

- Default: `process.cwd()/data/app.db`
- Automatically created with proper permissions
- WAL mode enabled for better concurrency

## Usage

### Automatic Collection

Telemetry is automatically collected for all API calls through:

- `next/config/api.ts` - Main API client interceptors
- `next/config/newApiClient.ts` - Alternative API client
- `next/instrumentation.ts` - Global instrumentation

### Manual Collection

```typescript
import { sendTelemetry } from "@/lib/db";

sendTelemetry({
  event: "custom_event",
  method: "GET",
  url: "/custom/endpoint",
  duration: 150,
  timestamp: new Date().toISOString(),
  environment: "production",
});
```

### Querying Data

```typescript
import { getTelemetryDB } from "@/lib/db";

// Only works on server-side
const telemetryDB = await getTelemetryDB();

// Get recent telemetry
const recent = telemetryDB.getRecent(100);

// Get errors only
const errors = telemetryDB.getErrors(50);

// Get statistics
const stats = telemetryDB.getStats();
```

## Architecture Details

### Client-Side (Browser)

- Uses `fetch()` to send telemetry to `/api/telemetry`
- Non-blocking with `keepalive: true`
- No database imports, preventing bundle issues

### Server-Side (API Routes)

- Direct SQLite database access
- Prepared statements for optimal performance
- Handles both POST (store) and GET (retrieve) operations

### Universal (Instrumentation)

- Same `sendTelemetry()` function works everywhere
- Automatically detects client vs server environment
- Uses appropriate strategy for each context

## Performance Considerations

- Telemetry runs asynchronously without affecting API performance
- Database uses WAL mode for concurrent read/write access
- Prepared statements ensure optimal query performance
- Sampling rate can be configured to reduce overhead

## Security

- No sensitive data logged to external services
- All telemetry stored locally in SQLite database
- Error messages truncated to prevent data leakage
- Telemetry endpoints excluded from their own tracking

## Maintenance

### Database Backup

```bash
cp data/app.db data/app.db.backup.$(date +%Y%m%d)
```

### Cleanup Old Data

```sql
DELETE FROM telemetry WHERE created_at < datetime('now', '-30 days');
```

### View Database Size

```sql
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

## Troubleshooting

### Database Not Found

- Ensure `/data` directory exists and is writable
- Check that `better-sqlite3` is installed in main package.json
- Verify API routes are accessible

### Missing Telemetry Data

- Check browser console for fetch errors
- Verify API routes are responding correctly
- Check that instrumentation is loading properly

### Performance Issues

- Add indexes for frequently queried columns
- Implement data retention policies
- Consider sampling for high-traffic applications

## File Structure

```
next/
├── lib/
│   └── db.ts              # Types + server-side DB access
├── app/api/telemetry/
│   ├── route.ts           # Main telemetry API
│   └── stats/route.ts      # Statistics endpoint
├── app/telemetry/
│   └── page.tsx           # Dashboard UI
├── components/ui/
│   ├── card.tsx            # Dashboard components
│   └── badge.tsx            # Status indicators
└── instrumentation.ts          # Global telemetry collection
```

This architecture ensures complete separation between client and server code while maintaining full telemetry functionality across all Next.js contexts.
