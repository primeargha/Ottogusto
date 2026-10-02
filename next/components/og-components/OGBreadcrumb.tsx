"use client";

import React from "react";
import Link from "next/link";
import { toSentenceCase, truncateLabel } from "@/utils/languageFormating";
import { usePathname } from "next/navigation";
import { detectPage } from "@/utils/detectPage";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { cleanHrefForBreadcrumbSchema, shouldNofollowBreadcrumbHref } from "@/utils/seoUrlParams";

export interface BreadcrumbLink {
  label: string;
  /** Omit for non-clickable segments (e.g. translated "Other category" on PDP). */
  href?: string;
}

interface OGBreadcrumbProps {
  links: BreadcrumbLink[];
  active: string;
}

const BASE_URL = (process.env.NEXT_PUBLIC_FRONTEND_PROD_URL || "https://ottogusto.com").replace(
  /\/+$/,
  "",
);

export default function OGBreadcrumb({ links, active }: OGBreadcrumbProps) {
  const pathname = usePathname();
  const pageName = detectPage(pathname ?? "");

  // On mobile, when we have 4+ segments (Home + Car Parts + L1 + …), show "..." instead of "Car Parts".
  // Both variants render always; CSS (not a client-only media query) picks which is visible, so there's
  // no post-hydration text swap / layout shift and the full label is always in the DOM for SEO.
  const collapseSecondLink = links.length >= 3;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...links.map((link, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: link.label,
        ...(link.href ? { item: `${BASE_URL}${cleanHrefForBreadcrumbSchema(link.href)}` } : {}),
      })),
      {
        "@type": "ListItem",
        position: links.length + 1,
        name: active,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* base:min-h-[36px] is a safety margin for deep category paths that wrap
          to a 2nd line on mobile (the `<ol>` below is flex-wrap) — the page
          skeleton only reserves 1 line, so without this an occasional 2-line
          wrap would shift content below the breadcrumb. */}
      <nav aria-label="Breadcrumb" className="py-space-sm base:min-h-[36px] gtsm:min-h-0">
        <ol className="flex flex-wrap items-center gap-space-xs text-color-text-muted typography-caption">
          {links.map((link, index) => {
            const isCollapsible = collapseSecondLink && index === 1;
            const labelText = isCollapsible ? "..." : toSentenceCase(link.label);
            return (
              <li key={`${link.href ?? link.label}-${index}`} className="flex items-center gap-1">
                {link.href ? (
                  <Link
                    href={link.href}
                    rel={shouldNofollowBreadcrumbHref(link.href) ? "nofollow" : undefined}
                    className="hover:text-color-text-emphasis hover:underline"
                  >
                    {isCollapsible ? (
                      <>
                        <span className="gtsm:hidden">...</span>
                        <span className="hidden gtsm:inline">{toSentenceCase(link.label)}</span>
                      </>
                    ) : (
                      labelText
                    )}
                  </Link>
                ) : (
                  <span className="text-color-text-muted">
                    {isCollapsible ? (
                      <>
                        <span className="gtsm:hidden">...</span>
                        <span className="hidden gtsm:inline">{toSentenceCase(link.label)}</span>
                      </>
                    ) : (
                      labelText
                    )}
                  </span>
                )}
                <span aria-hidden="true">/</span>
              </li>
            );
          })}
          {pageName === "product-details" ? (
            <li
              className="flex min-h-4 max-w-full cursor-not-allowed items-center whitespace-nowrap font-medium text-color-text-disabled"
              aria-current="page"
            >
              <CustomTooltip content={toSentenceCase(active)}>
                {" "}
                {toSentenceCase(truncateLabel(active))}
              </CustomTooltip>
            </li>
          ) : (
            <li
              className="cursor-not-allowed font-medium text-color-text-disabled"
              aria-current="page"
            >
              {active}
            </li>
          )}
        </ol>
      </nav>
    </>
  );
}
