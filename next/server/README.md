## Custom Next.js Server Enhancements

### 1. Worker Clustering

- **What**: Implemented Node.js `cluster` module
- **How**: Master process forks workers equal to CPU cores; crashed workers auto-restart
- **Benefit**: Improved request throughput, better CPU utilization, increased fault tolerance

### 2. Payload Compression

- **What**: Added Gzip/Brotli compression middleware
- **Benefit**: Smaller response sizes, faster page loads, reduced bandwidth usage

### 3. Security & Performance Headers

- **What**: Integrated `helmet` middleware
- **Benefit**: Enforces modern security best practices (HSTS, CSP, X-Frame-Options, etc.)

### 4. Static Asset Caching

- **What**: Configured `express.static` with `maxAge` and `immutable`
- **Benefit**: Enables 1-day browser caching for static assets, improving repeat load times

### 5. Environment-Aware Configuration

- **What**: Automatic dev/production switching via `NODE_ENV`
- **Fix**: Corrected directory resolution for the Next.js app
- **Benefit**: Reliable environment detection and consistent server startup
