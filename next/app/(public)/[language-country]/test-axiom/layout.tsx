import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAxiomTestEnabled } from "@/lib/axiom/is-axiom-test-enabled";

export const metadata: Metadata = {
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

export default function TestAxiomLayout({ children }: { children: React.ReactNode }) {
  if (!isAxiomTestEnabled()) {
    notFound();
  }

  return <>{children}</>;
}
