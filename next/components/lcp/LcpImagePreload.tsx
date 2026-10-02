/**
 * Emits <link rel="preload" as="image"> for LCP candidates.
 * Next.js hoists this into <head> when rendered from a Server Component.
 */
export default function LcpImagePreload({ href }: { href: string | null | undefined }) {
  if (!href) return null;
  return <link rel="preload" as="image" href={href} fetchPriority="high" />;
}
