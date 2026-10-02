// Client session management for telemetry
// Generates and manages unique session identifiers for tracking user activity

export class SessionManager {
  private static instance: SessionManager;
  private sessionId: string | null = null;
  private readonly SESSION_KEY = "telemetry_session_id";
  private readonly SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Get or create a session ID
  getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    // Try to get existing session from storage
    const existingSession = this.getStoredSession();
    if (existingSession && this.isSessionValid(existingSession)) {
      this.sessionId = existingSession.id;
      return this.sessionId;
    }

    // Create new session
    this.sessionId = this.generateSessionId();
    this.storeSession(this.sessionId);
    return this.sessionId;
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomPart}`;
  }

  // Store session in localStorage (client) or memory (server)
  private storeSession(sessionId: string): void {
    if (typeof window !== "undefined") {
      // Client-side: use localStorage
      try {
        const sessionData = {
          id: sessionId,
          createdAt: Date.now(),
          lastActivity: Date.now(),
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.warn("Failed to store session in localStorage:", error);
      }
    } else {
      // Server-side: store in memory (will be lost on restart)
      // For server-side persistence, you might want to use Redis or database
      if (!global.__TELEMETRY_SESSIONS__) {
        global.__TELEMETRY_SESSIONS__ = new Map();
      }
      global.__TELEMETRY_SESSIONS__.set("current", {
        id: sessionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      });
    }
  }

  // Get stored session data
  private getStoredSession(): { id: string; createdAt: number; lastActivity: number } | null {
    if (typeof window !== "undefined") {
      // Client-side: get from localStorage
      try {
        const stored = localStorage.getItem(this.SESSION_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to retrieve session from localStorage:", error);
      }
    } else {
      // Server-side: get from memory
      if (global.__TELEMETRY_SESSIONS__) {
        const session = global.__TELEMETRY_SESSIONS__.get("current");
        return session || null;
      }
    }
    return null;
  }

  // Check if session is still valid (not expired)
  private isSessionValid(session: {
    id: string;
    createdAt: number;
    lastActivity: number;
  }): boolean {
    const now = Date.now();
    const age = now - session.lastActivity;
    return age < this.SESSION_EXPIRY_MS;
  }

  // Update session activity timestamp
  updateActivity(): void {
    const session = this.getStoredSession();
    if (session) {
      session.lastActivity = Date.now();
      this.storeSession(session.id);
    }
  }

  // Clear current session
  clearSession(): void {
    this.sessionId = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.SESSION_KEY);
      } catch (error) {
        console.warn("Failed to clear session from localStorage:", error);
      }
    } else {
      if (global.__TELEMETRY_SESSIONS__) {
        global.__TELEMETRY_SESSIONS__.delete("current");
      }
    }
  }

  // Get session info for debugging
  getSessionInfo(): { id: string; age: number; isValid: boolean } | null {
    const session = this.getStoredSession();
    if (!session) {
      return null;
    }

    const now = Date.now();
    const age = now - session.createdAt;
    const isValid = this.isSessionValid(session);

    return {
      id: session.id,
      age,
      isValid,
    };
  }
}

// Global type declarations for server-side session storage
declare global {
  var __TELEMETRY_SESSIONS__:
    | Map<string, { id: string; createdAt: number; lastActivity: number }>
    | undefined;
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
