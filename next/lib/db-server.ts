import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync, existsSync, unlinkSync } from "fs";

// Database path configuration
const DB_PATH = join(process.cwd(), "data", "app.db");
const DATA_DIR = join(process.cwd(), "data");

let db: Database.Database | null = null;
let isDBAvailable = false;
let initializationError: string | null = null;

// Initialize database with error handling
function initializeDatabase() {
  try {
    // Check if we're in an environment that supports SQLite
    if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
      return;
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create database instance with WAL mode enabled

    db = new Database(DB_PATH);
    isDBAvailable = true;

    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = 1000000");
    db.pragma("temp_store = memory");

    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        event TEXT NOT NULL,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        status INTEGER,
        duration INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        environment TEXT NOT NULL,
        error TEXT,
        stack TEXT,
        node_version TEXT,
        request_payload TEXT,
        response_payload TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);
      CREATE INDEX IF NOT EXISTS idx_telemetry_event ON telemetry(event);
      CREATE INDEX IF NOT EXISTS idx_telemetry_url ON telemetry(url);
      CREATE INDEX IF NOT EXISTS idx_telemetry_session_id ON telemetry(session_id);
    `);
  } catch (error) {
    initializationError = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to initialize telemetry database:", error);
    console.error("📊 Error details:", initializationError);

    isDBAvailable = false;
  }
}

// Initialize database on module load
initializeDatabase();

// Prepared statements for telemetry (only if DB is available)
let insertTelemetryStmt: Database.Statement | null = null;

// Initialize prepared statements if database is available
if (db && isDBAvailable) {
  insertTelemetryStmt = (db as Database.Database).prepare(`
    INSERT INTO telemetry (
      session_id, event, method, url, status, duration, timestamp, environment,
      error, stack, node_version, request_payload, response_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
}

// Telemetry functions with graceful fallback
export const telemetryDB = {
  insert: (data: {
    sessionId?: string;
    event: string;
    method: string;
    url: string;
    status?: number;
    duration: number;
    timestamp: string;
    environment: string;
    error?: string;
    stack?: string;
    nodeVersion?: string;
    requestPayload?: string;
    responsePayload?: string;
  }) => {
    if (!db || !isDBAvailable || !insertTelemetryStmt) {
      console.log(`
📊 TELEMETRY INSERT SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - telemetry data not stored        │
│                                                             │
│  Event: ${data.event.padEnd(20)} Method: ${data.method.padEnd(8)}         │
│  URL: ${data.url.substring(0, 40).padEnd(40)}${data.url.length > 40 ? "..." : ""} │
│  Duration: ${data.duration}ms                                           │
│  Session: ${data.sessionId ? data.sessionId.substring(0, 12) + "..." : "None".padEnd(15)}     │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return { lastInsertRowid: 0 };
    }
    return insertTelemetryStmt.run(
      data.sessionId,
      data.event,
      data.method,
      data.url,
      data.status,
      data.duration,
      data.timestamp,
      data.environment,
      data.error,
      data.stack,
      data.nodeVersion,
      data.requestPayload,
      data.responsePayload,
    );
  },

  getRecent: (limit = 100) => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getRecent()                                         │
│  Limit: ${limit.toString().padEnd(10)}                                    │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    // Get most recent telemetry entries ordered by creation time
    const result = db
      .prepare(
        `
      SELECT * FROM telemetry 
      ORDER BY created_at DESC 
      LIMIT ?
    `,
      )
      .all(limit);
    return result;
  },

  getByEvent: (event: string, limit = 50) => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getByEvent()                                        │
│  Event: ${event.padEnd(20)}                                         │
│  Limit: ${limit.toString().padEnd(10)}                                    │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    return db
      .prepare(
        `
      SELECT * FROM telemetry 
      WHERE event = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `,
      )
      .all(event, limit);
  },

  getErrors: (limit = 50) => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getErrors()                                         │
│  Limit: ${limit.toString().padEnd(10)}                                    │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    return db
      .prepare(
        `
      SELECT * FROM telemetry 
      WHERE event = 'api_error' 
      ORDER BY created_at DESC 
      LIMIT ?
    `,
      )
      .all(limit);
  },

  getStats: () => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getStats()                                          │
│  Type: 24-hour performance summary                          │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    return db
      .prepare(
        `
      SELECT 
        session_id,
        event,
        COUNT(*) as count,
        AVG(duration) as avg_duration,
        MIN(duration) as min_duration,
        MAX(duration) as max_duration
      FROM telemetry 
      WHERE created_at > datetime('now', '-24 hours')
      GROUP BY session_id, event
    `,
      )
      .all();
  },

  getSessions: () => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getSessions()                                       │
│  Type: Session activity summary                             │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    // Get all distinct sessions with their activity summary
    const result = db
      .prepare(
        `
      SELECT DISTINCT 
        session_id,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen,
        COUNT(*) as total_events
      FROM telemetry 
      WHERE session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY last_seen DESC
    `,
      )
      .all();
    return result;
  },

  getBySession: (sessionId: string, limit = 50) => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getBySession()                                      │
│  Session: ${sessionId ? sessionId.substring(0, 20) + (sessionId.length > 20 ? "..." : "") : "None".padEnd(23)}     │
│  Limit: ${limit.toString().padEnd(10)}                                    │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    // Get all telemetry entries for a specific session
    const result = db
      .prepare(
        `
      SELECT * FROM telemetry 
      WHERE session_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `,
      )
      .all(sessionId, limit);
    return result;
  },

  getBySessionAndEvent: (sessionId: string, event: string | null, limit = 50) => {
    if (!db || !isDBAvailable) {
      console.log(`
📊 TELEMETRY QUERY SKIPPED
┌─────────────────────────────────────────────────────────────┐
│  Database not available - returning empty result set       │
│                                                             │
│  Query: getBySessionAndEvent()                              │
│  Session: ${sessionId ? sessionId.substring(0, 20) + (sessionId.length > 20 ? "..." : "") : "None".padEnd(23)}     │
│  Event: ${event ? event.padEnd(20) : "All events".padEnd(20)}                                     │
│  Limit: ${limit.toString().padEnd(10)}                                    │
│                                                             │
│  💡 This is expected in production/serverless environments │
└─────────────────────────────────────────────────────────────┘
      `);
      return [];
    }
    // Get telemetry entries for a specific session, optionally filtered by event type
    let query = `
      SELECT * FROM telemetry 
      WHERE session_id = ?
    `;
    const params: any[] = [sessionId];

    if (event && event.trim() !== "") {
      query += ` AND event = ?`;
      params.push(event);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const result = db.prepare(query).all(...params);
    return result;
  },
};

// Export database instance for direct queries if needed
export default db;
