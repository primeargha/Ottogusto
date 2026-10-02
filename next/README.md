## OttoGusto

First, run the development server:

```bash
npm run dev
```

For production build

```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

To create [API routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) add an `api/` directory to the `app/` directory with a `route.ts` file. For individual endpoints, create a subfolder in the `api` directory, like `api/hello/route.ts` would map to [http://localhost:3000/api/hello](http://localhost:3000/api/hello).

## Telemetry System

This application includes a comprehensive telemetry system for monitoring API calls, errors, and user sessions.

### Features

- **Session-based tracking** with automatic session ID generation
- **Real-time dashboard** at `/[locale]/telemetry` for viewing metrics
- **Performance monitoring** with duration tracking and error analysis
- **Non-blocking operation** that doesn't impact application performance

### Quick Start

1. The telemetry system starts automatically when the application runs
2. Visit `/en-BE/telemetry` (or your preferred locale) to view the dashboard
3. Sessions are automatically created and tracked as you use the application

### Key Components

- **Database**: SQLite with automatic schema management
- **Session Manager**: Handles session identification and tracking
- **API Endpoints**: `/api/telemetry`, `/api/telemetry/stats`, `/api/telemetry/sessions`
- **Dashboard**: Interactive UI for filtering and analyzing telemetry data

### Documentation

See [docs/TELEMETRY.md](./docs/TELEMETRY.md) for comprehensive documentation including:

- Database schema and API endpoints
- Session management details
- Integration guides
- Troubleshooting and best practices

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn/foundations/about-nextjs) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_source=github&utm_medium=referral&utm_campaign=turborepo-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
