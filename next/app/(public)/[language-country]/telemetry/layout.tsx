import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemetry Dashboard",
  description: "Internal API performance monitoring dashboard",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
};

export default function TelemetryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
